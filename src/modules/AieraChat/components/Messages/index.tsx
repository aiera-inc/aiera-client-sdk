import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { log } from '@aiera/client-sdk/lib/utils';
import { CHANNEL_PREFIX, useAbly } from '@aiera/client-sdk/modules/AieraChat/services/ably';
import { ChatSessionWithPromptMessage } from '@aiera/client-sdk/modules/AieraChat/services/types';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import {
    VirtuosoMessageList,
    VirtuosoMessageListLicense,
    VirtuosoMessageListMethods,
} from '@virtuoso.dev/message-list';
import { RealtimeChannel } from 'ably';
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ChatMessagePrompt,
    ChatMessageResponse,
    ChatMessageStatus,
    ChatMessageType,
    ChatMessage,
    useChatSession,
} from '../../services/messages';
import { MessageGroup, groupMessages } from '../../services/messageGroups';
import { Source, useChatStore } from '../../store';
import { MessageFactory } from './MessageFactory';
import { BlockType } from './MessageFactory/Block';
import { Prompt } from './Prompt';
// import { SuggestedPrompts } from './SuggestedPrompts';
import { Loading } from './MessageFactory/Loading';
import './styles.css';

let idCounter = 0;

export interface MessageListContext {
    onSubmit: (p: string) => void;
    onReRun: (k: string) => void;
    onConfirm: (messageId: string, sources: Source[]) => void;
}

export function Messages({
    onOpenSources,
    onSubmit,
    virtuosoRef,
}: {
    onOpenSources: () => void;
    onSubmit: (prompt: string) => Promise<ChatSessionWithPromptMessage | null>;
    virtuosoRef: RefObject<VirtuosoMessageListMethods<MessageGroup>>;
}) {
    const config = useConfig();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const { chatId, chatStatus, onAddSource, onSetStatus, sources } = useChatStore();
    const { confirmSourceConfirmation, createChatMessagePrompt, messages, isLoading } = useChatSession({
        enablePolling: config.options?.aieraChatEnablePolling || false,
    });
    const { citations, confirmation, partials, reset, subscribeToChannel, unsubscribeFromChannel } = useAbly();
    const subscribedChannel = useRef<RealtimeChannel | null>(null);

    const messageGroups = useMemo(() => groupMessages(messages), [messages]);

    const onReRun = useCallback((ordinalId: string) => {
        const currentGroups = virtuosoRef.current?.data.get() || [];
        const groupIndex = currentGroups.findIndex((group) => group.messages.some((m) => m.ordinalId === ordinalId));

        if (groupIndex !== -1) {
            setTimeout(() => {
                let counter = 0;
                let newMessage = '';
                const interval = setInterval(() => {
                    let status = ChatMessageStatus.QUEUED;
                    if (counter++ > 80) {
                        clearInterval(interval);
                        status = ChatMessageStatus.COMPLETED;
                    } else if (counter > 10) {
                        status = ChatMessageStatus.STREAMING;
                    }

                    virtuosoRef.current?.data.map(
                        (group) => {
                            const messageIndex = group.messages.findIndex((m) => m.ordinalId === ordinalId);
                            if (messageIndex !== -1) {
                                newMessage = newMessage + ' ' + 'some message';
                                const updatedMessage = {
                                    ...group.messages[messageIndex],
                                    text: newMessage,
                                    status,
                                } as ChatMessage & { text: string };

                                const updatedMessages = [...group.messages];
                                updatedMessages[messageIndex] = updatedMessage;

                                return {
                                    ...group,
                                    messages: updatedMessages,
                                };
                            }
                            return group;
                        },
                        {
                            location() {
                                return { index: groupIndex, align: 'end', behavior: 'smooth' };
                            },
                        }
                    );
                }, 150);
            });
        }
    }, []);

    const onConfirm = useCallback(
        (promptMessageId: string, sources: Source[]) => {
            confirmSourceConfirmation(promptMessageId, sources)
                .then((confirmationMessage) => {
                    // Update sources in the global store
                    onAddSource(sources);
                    if (confirmationMessage?.id) {
                        // Find the matching group and update the sources message
                        const currentGroups = virtuosoRef.current?.data.get() || [];
                        const targetGroup = currentGroups.find(
                            (group) => group.id === confirmationMessage.promptMessageId
                        );

                        if (targetGroup) {
                            virtuosoRef.current?.data.map((group) => {
                                if (group.id === targetGroup.id) {
                                    const updatedMessages = group.messages.map((message) =>
                                        message.type === ChatMessageType.SOURCES
                                            ? { ...message, confirmed: true }
                                            : message
                                    );

                                    return {
                                        ...group,
                                        messages: updatedMessages,
                                    };
                                }
                                return group;
                            });
                        }
                    }
                })
                .then(() => {
                    // Reset existing partials before new ones start streaming
                    if (partials && partials.length > 0) {
                        reset().catch((err: Error) => log(`Error resetting useAbly state: ${err.message}`, 'error'));
                    }
                })
                .then(() => onSetStatus(ChatSessionStatus.GeneratingResponse))
                .catch((err: Error) =>
                    log(`Error confirming sources for chat message source confirmation: ${err.message}`, 'error')
                );
        },
        [confirmSourceConfirmation, onAddSource, partials, reset, virtuosoRef.current?.data]
    );

    const handleSubmit = useCallback(
        (prompt: string) => {
            setSubmitting(true);
            if (chatId === 'new') {
                onSubmit(prompt)
                    .then((session) => {
                        if (session && session.promptMessage) {
                            // Only prompt messages can be created when creating a chat session
                            const promptMessage: ChatMessagePrompt = {
                                id: session.promptMessage.id,
                                ordinalId: session.promptMessage.ordinalId,
                                prompt: session.promptMessage.prompt,
                                status: ChatMessageStatus.COMPLETED,
                                timestamp: new Date().toISOString(),
                                type: ChatMessageType.PROMPT,
                            };

                            // Create a new group for this prompt message
                            const newGroup: MessageGroup = {
                                id: promptMessage.id,
                                timestamp: promptMessage.timestamp,
                                messages: [promptMessage],
                            };

                            // Append new group to virtuoso
                            virtuosoRef.current?.data.append([newGroup], ({ scrollInProgress, atBottom }) => {
                                return {
                                    index: 'LAST',
                                    align: 'end',
                                    behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
                                };
                            });
                        }
                    })
                    .then(() =>
                        onSetStatus(
                            sources && sources.length > 0
                                ? ChatSessionStatus.GeneratingResponse
                                : ChatSessionStatus.FindingSources
                        )
                    )
                    .catch((error: Error) => log(`Error creating session with prompt: ${error.message}`, 'error'))
                    .finally(() => setSubmitting(false));
            } else {
                createChatMessagePrompt({ content: prompt, sessionId: chatId })
                    .then(() => {
                        // Update the session status to reflect what the server will persist
                        // This is needed to restart streaming partials for an existing session
                        onSetStatus(
                            sources && sources.length > 0
                                ? ChatSessionStatus.GeneratingResponse
                                : ChatSessionStatus.FindingSources
                        );
                    })
                    .then(() => {
                        // Reset existing partials before new ones start streaming
                        if (partials && partials.length > 0) {
                            reset().catch((err: Error) =>
                                log(`Error resetting useAbly state: ${err.message}`, 'error')
                            );
                        }
                    })
                    .catch((error: Error) => log(`Error creating session with prompt: ${error.message}`, 'error'))
                    .finally(() => setSubmitting(false));
            }
        },
        [chatId, createChatMessagePrompt, onSetStatus, onSubmit, partials, reset, sources]
    );

    const maybeClearVirtuoso = useCallback(
        (message: string) => {
            const existingItems = virtuosoRef.current?.data.get();
            if (existingItems && existingItems.length > 0) {
                // Log the provided message depending on invocation
                log(`Message: ${JSON.stringify(message)}`, 'debug');
                virtuosoRef.current?.data.replace([]);
            }
        },
        [virtuosoRef.current?.data]
    );

    // Subscribe/unsubscribe to partial messages
    useEffect(() => {
        const channelName = `${CHANNEL_PREFIX}:${chatId}`;
        let currentChannel: RealtimeChannel | null;

        const handleChannelSwitch = async () => {
            // If we're switching to a new chat or don't have a channel yet
            if (chatId !== 'new' && (!subscribedChannel.current || subscribedChannel.current.name !== channelName)) {
                // Store reference to the old channel
                const oldChannel = subscribedChannel.current;

                // Clear the subscribed channel state immediately to prevent race conditions
                subscribedChannel.current = null;

                // Detach from old channel if it exists
                if (oldChannel) {
                    log(`Detaching from old channel: ${oldChannel.name}`);
                    await unsubscribeFromChannel(oldChannel.name);
                }

                // Now subscribe to the new channel
                try {
                    log(`Attempting to subscribe to channel: ${channelName}`);
                    const channel = subscribeToChannel(channelName);
                    if (channel) {
                        currentChannel = channel;
                        log(`Successfully subscribed to Ably channel ${channelName}`);
                        subscribedChannel.current = channel;
                    }
                } catch (e) {
                    log(`Failed to subscribe to Ably channel ${channelName}: ${String(e)}`, 'error');
                }
            }

            // If switching to 'new' chat, unsubscribe from any existing channel
            if (chatId === 'new' && subscribedChannel.current) {
                const channelToUnsubscribe = subscribedChannel.current.name;
                subscribedChannel.current = null;
                await unsubscribeFromChannel(channelToUnsubscribe);
            }
        };

        void handleChannelSwitch();

        // Cleanup function
        return () => {
            // Clean up the current channel if it exists
            if (currentChannel) {
                const channelName = currentChannel.name;
                log(`Cleanup: detaching from channel ${channelName}`);
                void unsubscribeFromChannel(channelName);
            }

            // Also clean up any subscribed channel that might still be set
            if (subscribedChannel.current && subscribedChannel.current.name !== currentChannel?.name) {
                const channelName = subscribedChannel.current.name;
                log(`Cleanup: detaching from subscribed channel ${channelName}`);
                void unsubscribeFromChannel(channelName);
            }
        };
    }, [chatId, subscribeToChannel, unsubscribeFromChannel]);

    // Append new message groups to virtuoso as they're created
    useEffect(() => {
        if (messageGroups.length > 0) {
            const existingGroups = virtuosoRef.current?.data.get() || [];
            const existingGroupIds = new Set(existingGroups.map((g) => g.id));

            // Find new groups
            const newGroups = messageGroups.filter((group) => !existingGroupIds.has(group.id));

            if (newGroups.length > 0) {
                virtuosoRef.current?.data.append(newGroups, ({ scrollInProgress, atBottom }) => {
                    return {
                        index: 'LAST',
                        align: 'end',
                        behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
                    };
                });
            } else {
                // Update existing groups
                // virtuosoRef.current?.data.replace(messageGroups);
            }
        } else {
            // Wipe all items from virtuoso if message groups are cleared out
            maybeClearVirtuoso('Removing stale items from virtuoso list...');
        }
    }, [messageGroups, virtuosoRef.current?.data]);

    // Process partial messages from Ably for streaming
    useEffect(() => {
        if (partials && partials.length > 0) {
            // Get the latest group in virtuoso
            const latestGroup = virtuosoRef.current?.data.get()?.at(-1);
            const latestResponseMessage = latestGroup?.messages.find(
                (m) => m.type === ChatMessageType.RESPONSE && m.status === ChatMessageStatus.STREAMING
            );

            // If the latest group has a response message that's streaming, update its content
            if (latestResponseMessage) {
                // Get the latest partial
                const latestPartial = partials[partials.length - 1] as string;
                virtuosoRef.current?.data.map(
                    (group) => {
                        // When the latest partial is found in the existing virtuoso list,
                        // update its Text block's content with the latest partial message
                        if (latestGroup?.id === group.id) {
                            const updatedMessages = group.messages.map((message) => {
                                if (
                                    message.id === latestResponseMessage.id &&
                                    message.type === ChatMessageType.RESPONSE
                                ) {
                                    const updatedResponseMessage = {
                                        ...message,
                                        blocks: message.blocks.map((b) => {
                                            if (b.type === BlockType.TEXT) {
                                                // Only update citations if new ones are available, otherwise preserve existing
                                                const updatedBlock = {
                                                    ...b,
                                                    content: b.content + latestPartial,
                                                };

                                                // Only update citations if we have new ones from Ably
                                                if (citations && citations.length > 0) {
                                                    updatedBlock.citations = citations;
                                                }

                                                return updatedBlock;
                                            } else {
                                                return b;
                                            }
                                        }),
                                    };
                                    return updatedResponseMessage;
                                }
                                return message;
                            });

                            return {
                                ...group,
                                messages: updatedMessages,
                            };
                        }
                        return group;
                    },
                    {
                        location() {
                            return { index: 'LAST', align: 'end', behavior: 'smooth' };
                        },
                    }
                );
            } else {
                // Get the latest group to ensure the sticky header works
                const groups = virtuosoRef.current?.data.get() || [];
                const latestGroup = groups[groups.length - 1];
                const latestPrompt = latestGroup?.messages.find((message) => message.type === ChatMessageType.PROMPT);

                // If there's no streaming message yet, append one to the latest group using existing partials
                if (latestGroup && latestPrompt) {
                    const initialMessageResponse: ChatMessageResponse = {
                        id: `chat-${chatId}-temp-response-${latestPrompt.id || groups.length + 1}-${idCounter++}`,
                        ordinalId: `chat-${chatId}-temp-ordinal-${idCounter++}`,
                        prompt: latestPrompt.prompt || '',
                        promptMessageId: latestPrompt.id ? String(latestPrompt.id) : undefined,
                        status: ChatMessageStatus.STREAMING,
                        timestamp: new Date().toISOString(),
                        type: ChatMessageType.RESPONSE,
                        blocks: [
                            {
                                // Only include citations if they exist, don't set to undefined
                                ...(citations && citations.length > 0 && { citations }),
                                content: partials.join(' '),
                                id: 'initial-block',
                                type: BlockType.TEXT,
                            },
                        ],
                        sources: [], // partial messages won't have sources
                    };

                    // Update the latest group with the new response message
                    const updatedGroup = {
                        ...latestGroup,
                        messages: [...latestGroup.messages, initialMessageResponse],
                    };

                    // Update the group in virtuoso
                    virtuosoRef.current?.data.map((group) => (group.id === latestGroup.id ? updatedGroup : group));
                }
            }
        }
    }, [citations, partials, virtuosoRef.current?.data]);

    // Update virtuoso with any source confirmation messages coming from Ably
    useEffect(() => {
        if (confirmation) {
            const currentGroups = virtuosoRef.current?.data.get() || [];
            const targetGroup = currentGroups.find((group) => group.id === confirmation.promptMessageId);

            if (targetGroup) {
                // Check if this confirmation message already exists in the group
                const existingMessage = targetGroup.messages.find((m) => m.id === confirmation.id);
                if (!existingMessage) {
                    // Add the confirmation message to the group
                    const promptMessage = targetGroup.messages.find((m) => m.type === ChatMessageType.PROMPT);
                    const updatedConfirmation = {
                        ...confirmation,
                        prompt: promptMessage?.prompt ?? '',
                    };

                    const updatedGroup = {
                        ...targetGroup,
                        messages: [...targetGroup.messages, updatedConfirmation],
                    };

                    // Update the group in virtuoso
                    virtuosoRef.current?.data.map((group) => (group.id === targetGroup.id ? updatedGroup : group));
                }
            }
        }
    }, [confirmation, virtuosoRef.current?.data]);

    // Reset messages when the selected chat changes
    useEffect(() => {
        maybeClearVirtuoso('New chat detected. Clearing virtuoso items...');
        // Reset Ably state when switching chats
        reset().catch((err: Error) => log(`Error resetting Ably state on chat change: ${err.message}`, 'error'));
    }, [chatId, reset]);

    // Create a memoized context object that updates when any of its values change
    const context = useMemo(
        () => ({
            onSubmit: handleSubmit,
            onReRun,
            onConfirm,
        }),
        [handleSubmit, onReRun, onConfirm]
    );

    return (
        <div className="relative flex-1">
            <div className="absolute bottom-0 left-0 right-0 top-4 flex flex-col flex-1">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center pb-3">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <VirtuosoMessageListLicense licenseKey={config.virtualListKey || ''}>
                        <VirtuosoMessageList<MessageGroup, MessageListContext>
                            className="px-4 messagesScrollBars"
                            computeItemKey={({ data }: { data: MessageGroup }) => data.id}
                            initialData={messageGroups}
                            initialLocation={{ index: 'LAST', align: 'end' }}
                            key={chatId || 'new'}
                            ref={virtuosoRef}
                            shortSizeAlign="bottom-smooth"
                            style={{ flex: 1 }}
                            context={context}
                            // EmptyPlaceholder={SuggestedPrompts}
                            ItemContent={MessageFactory}
                        />
                    </VirtuosoMessageListLicense>
                )}
                {((chatStatus === ChatSessionStatus.FindingSources && !confirmation) ||
                    chatStatus === ChatSessionStatus.GeneratingResponse) && <Loading>Thinking...</Loading>}
                <Prompt onSubmit={handleSubmit} onOpenSources={onOpenSources} submitting={submitting} />
            </div>
        </div>
    );
}
