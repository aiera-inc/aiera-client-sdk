import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { RealtimeChannel } from 'ably';

import { actAndFlush, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import { Messages } from '.';
import { useChatStore } from '../../store';
import * as ablyService from '../../services/ably';
import * as messageService from '../../services/messages';
import { ChatMessage, ChatMessageType, ChatMessageStatus, ChatMessageResponse } from '../../services/messages';
import { BlockType } from './MessageFactory/Block';

jest.mock('../../services/ably');
jest.mock('../../services/messages');
interface MockMessageFactoryProps {
    message: {
        id: string;
        type: string;
        prompt?: string;
        promptMessageId?: string;
    };
    setRef?: (node: HTMLDivElement | null, id: string) => void;
}

jest.mock('./MessageFactory', () => ({
    MessageFactory: ({ message, setRef }: MockMessageFactoryProps) => (
        <div data-testid={`message-${message.id}`} ref={(node) => setRef && setRef(node, message.id)}>
            <span>{message.type}</span>
            <span>{message.prompt}</span>
        </div>
    ),
}));

interface MockPromptProps {
    onSubmit: (prompt: string) => void;
    onOpenSources: () => void;
    submitting: boolean;
}

jest.mock('./Prompt', () => ({
    Prompt: ({ onSubmit, onOpenSources, submitting }: MockPromptProps) => (
        <div data-testid="prompt">
            <input data-testid="prompt-input" onChange={(e) => e.target.value} disabled={submitting} />
            <button onClick={() => onSubmit('test prompt')} disabled={submitting}>
                Submit
            </button>
            <button onClick={onOpenSources}>Open Sources</button>
        </div>
    ),
}));

const mockChannel = {
    name: 'test-channel',
    attach: jest.fn().mockResolvedValue(undefined),
    detach: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
} as unknown as RealtimeChannel;

const mockUseAbly = {
    citations: [],
    partials: [],
    reset: jest.fn().mockResolvedValue(undefined),
    subscribeToChannel: jest.fn((channelName: string) => ({
        ...mockChannel,
        name: channelName,
    })),
    unsubscribeFromChannel: jest.fn().mockResolvedValue(undefined),
    thinkingState: ['Thinking...'],
};

const mockUseChatSession = {
    createChatMessagePrompt: jest.fn().mockResolvedValue({ id: 'new-prompt' }),
    messages: [],
    setMessages: jest.fn(),
    isLoading: false,
};

describe('Messages', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Reset stores
        useChatStore.setState({
            chatId: 'test-chat-id',
            chatStatus: ChatSessionStatus.Active,
            sources: [],
            onAddSource: jest.fn(),
            onSetStatus: jest.fn(),
        });

        // Setup mocks
        (ablyService.useAbly as jest.Mock).mockReturnValue(mockUseAbly);
        (messageService.useChatSession as jest.Mock).mockReturnValue(mockUseChatSession);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders loading state when isLoading is true', async () => {
        (messageService.useChatSession as jest.Mock).mockReturnValue({
            ...mockUseChatSession,
            isLoading: true,
        });

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByTestId('prompt')).toBeInTheDocument();
    });

    test('renders empty state when no messages', async () => {
        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        expect(screen.getByTestId('prompt')).toBeInTheDocument();
    });

    test('renders messages grouped by prompt', async () => {
        const messages: ChatMessage[] = [
            {
                id: 'prompt-1',
                type: ChatMessageType.PROMPT,
                prompt: 'First question',
                status: ChatMessageStatus.COMPLETED,
                timestamp: new Date().toISOString(),
            },
            {
                id: 'response-1',
                type: ChatMessageType.RESPONSE,
                prompt: 'First question',
                status: ChatMessageStatus.COMPLETED,
                promptMessageId: 'prompt-1',
                timestamp: new Date().toISOString(),
                blocks: [],
                sources: [],
            },
            {
                id: 'prompt-2',
                type: ChatMessageType.PROMPT,
                prompt: 'Second question',
                status: ChatMessageStatus.COMPLETED,
                timestamp: new Date().toISOString(),
            },
        ];

        (messageService.useChatSession as jest.Mock).mockReturnValue({
            ...mockUseChatSession,
            messages,
        });

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        expect(screen.getByTestId('message-prompt-1')).toBeInTheDocument();
        expect(screen.getByTestId('message-response-1')).toBeInTheDocument();
        expect(screen.getByTestId('message-prompt-2')).toBeInTheDocument();
    });

    test('subscribes to Ably channel on mount', async () => {
        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        expect(mockUseAbly.subscribeToChannel).toHaveBeenCalledWith('user-chat:test-chat-id');
    });

    test('unsubscribes from Ably channel when chat changes', async () => {
        const { rerender } = await actAndFlush(() =>
            renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />)
        );

        // Change chat ID
        useChatStore.setState({ chatId: 'new-chat-id' });

        await actAndFlush(() => rerender(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        expect(mockUseAbly.unsubscribeFromChannel).toHaveBeenCalledWith('user-chat:test-chat-id');
        expect(mockUseAbly.subscribeToChannel).toHaveBeenCalledWith('user-chat:new-chat-id');
    });

    test('handles new chat creation with prompt', async () => {
        const onSubmit = jest.fn().mockResolvedValue({
            id: 'new-session',
            promptMessage: {
                id: 'prompt-msg-1',
                ordinalId: 'ord-1',
                prompt: 'test prompt',
            },
        });

        useChatStore.setState({ chatId: 'new' });

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={onSubmit} />));

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith('test prompt');
            expect(mockUseChatSession.setMessages).toHaveBeenCalled();
        });

        // Should update status
        expect(useChatStore.getState().onSetStatus).toHaveBeenCalledWith(ChatSessionStatus.FindingSources);
    });

    test('handles existing chat prompt submission', async () => {
        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(mockUseChatSession.createChatMessagePrompt).toHaveBeenCalledWith({
                content: 'test prompt',
                sessionId: 'test-chat-id',
            });
        });

        expect(useChatStore.getState().onSetStatus).toHaveBeenCalledWith(ChatSessionStatus.FindingSources);
    });

    test('handles prompt submission with existing sources', async () => {
        useChatStore.setState({
            sources: [{ targetId: 'source-1', targetType: 'event', title: 'Source 1' }],
        });

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(useChatStore.getState().onSetStatus).toHaveBeenCalledWith(ChatSessionStatus.GeneratingResponse);
        });
    });

    test('opens sources panel when button clicked', async () => {
        const onOpenSources = jest.fn();

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={onOpenSources} onSubmit={jest.fn()} />));

        fireEvent.click(screen.getByText('Open Sources'));

        expect(onOpenSources).toHaveBeenCalled();
    });

    test('displays finding sources status', async () => {
        const messages: ChatMessage[] = [
            {
                id: 'prompt-1',
                type: ChatMessageType.PROMPT,
                prompt: 'Test question',
                status: ChatMessageStatus.COMPLETED,
                timestamp: new Date().toISOString(),
            },
        ];

        (messageService.useChatSession as jest.Mock).mockReturnValue({
            ...mockUseChatSession,
            messages,
        });

        (ablyService.useAbly as jest.Mock).mockReturnValue({
            ...mockUseAbly,
            thinkingState: ['Finding sources...'],
        });

        useChatStore.setState({
            chatStatus: ChatSessionStatus.FindingSources,
        });

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        expect(screen.getByText('Finding sources...')).toBeInTheDocument();
    });

    test('displays generating response status with thinking state', async () => {
        const messages: ChatMessage[] = [
            {
                id: 'prompt-1',
                type: ChatMessageType.PROMPT,
                prompt: 'Test question',
                status: ChatMessageStatus.COMPLETED,
                timestamp: new Date().toISOString(),
            },
        ];

        (messageService.useChatSession as jest.Mock).mockReturnValue({
            ...mockUseChatSession,
            messages,
        });

        (ablyService.useAbly as jest.Mock).mockReturnValue({
            ...mockUseAbly,
            thinkingState: ['Analyzing your question...'],
        });

        useChatStore.setState({
            chatStatus: ChatSessionStatus.GeneratingResponse,
        });

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        expect(screen.getByText('Analyzing your question...')).toBeInTheDocument();
    });

    test('processes streaming partials', async () => {
        const partials = [
            { blocks: [{ content: 'Hello' }], is_final: false },
            { blocks: [{ content: ' world' }], is_final: false },
        ];

        (ablyService.useAbly as jest.Mock).mockReturnValue({
            ...mockUseAbly,
            partials,
            citations: [{ sourceId: 'source-1', sourceType: 'event' }],
        });

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        // Should create streaming message
        expect(mockUseChatSession.setMessages).toHaveBeenCalled();
        const setMessagesCall = (mockUseChatSession.setMessages.mock.calls[0] as unknown[])[0] as (
            messages: ChatMessage[]
        ) => ChatMessage[];
        const newMessages = setMessagesCall([]);

        expect(newMessages).toHaveLength(1);
        expect(newMessages[0]?.type).toBe(ChatMessageType.RESPONSE);
        expect(newMessages[0]?.status).toBe(ChatMessageStatus.STREAMING);
        expect((newMessages[0] as ChatMessageResponse).blocks[0]?.content).toBe('Hello world');
        expect((newMessages[0] as ChatMessageResponse).blocks[0]?.citations).toHaveLength(1);
    });

    test('handles final partial message', async () => {
        const partials = [
            { blocks: [{ content: 'Complete response' }], is_final: true, prompt_message_id: 'prompt-1' },
        ];

        (ablyService.useAbly as jest.Mock).mockReturnValue({
            ...mockUseAbly,
            partials,
        });

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        const setMessagesCall = (mockUseChatSession.setMessages.mock.calls[0] as unknown[])[0] as (
            messages: ChatMessage[]
        ) => ChatMessage[];
        const newMessages = setMessagesCall([]);

        expect(newMessages[0]?.status).toBe(ChatMessageStatus.COMPLETED);
    });

    test('scrolls to latest prompt message', async () => {
        const scrollIntoViewMock = jest.fn();
        HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

        const messages: ChatMessage[] = [
            {
                id: 'prompt-1',
                type: ChatMessageType.PROMPT,
                prompt: 'First question',
                status: ChatMessageStatus.COMPLETED,
                timestamp: new Date().toISOString(),
            },
            {
                id: 'response-1',
                type: ChatMessageType.RESPONSE,
                prompt: 'First question',
                status: ChatMessageStatus.COMPLETED,
                timestamp: new Date().toISOString(),
                blocks: [],
                sources: [],
            },
            {
                id: 'prompt-2',
                type: ChatMessageType.PROMPT,
                prompt: 'Second question',
                status: ChatMessageStatus.COMPLETED,
                timestamp: new Date().toISOString(),
            },
        ];

        (messageService.useChatSession as jest.Mock).mockReturnValue({
            ...mockUseChatSession,
            messages: [],
        });

        const { rerender } = await actAndFlush(() =>
            renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />)
        );

        // Update messages
        (messageService.useChatSession as jest.Mock).mockReturnValue({
            ...mockUseChatSession,
            messages,
        });

        await actAndFlush(() => rerender(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        // Run all timers to execute requestAnimationFrame
        await actAndFlush(() => {
            jest.runAllTimers();
        });

        expect(scrollIntoViewMock).toHaveBeenCalledWith({
            behavior: 'smooth',
            block: 'start',
        });
    });

    test('resets state when chat changes', async () => {
        const { rerender } = await actAndFlush(() =>
            renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />)
        );

        useChatStore.setState({ chatId: 'new-chat-id' });

        await actAndFlush(() => rerender(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        expect(mockUseAbly.reset).toHaveBeenCalledWith({ clearCitations: true });
        expect(mockUseChatSession.setMessages).toHaveBeenCalledWith([]);
    });

    test('disables prompt input while submitting', async () => {
        await actAndFlush(() =>
            renderWithProvider(
                <Messages
                    onOpenSources={jest.fn()}
                    onSubmit={jest.fn().mockImplementation(() => new Promise(() => undefined))}
                />
            )
        );

        const submitButton = screen.getByText('Submit');

        fireEvent.click(submitButton);

        // Should be disabled while submitting
        expect(submitButton).toBeDisabled();
        expect(screen.getByTestId('prompt-input')).toBeDisabled();
    });

    test('skips partials if complete message already exists', async () => {
        const existingMessages: ChatMessage[] = [
            {
                id: 'response-1',
                type: ChatMessageType.RESPONSE,
                promptMessageId: 'prompt-1',
                prompt: 'Test question',
                status: ChatMessageStatus.COMPLETED,
                timestamp: new Date().toISOString(),
                blocks: [],
                sources: [],
                ordinalId: 'ord-1',
            } as ChatMessageResponse,
        ];

        const partials = [{ blocks: [{ content: 'Duplicate' }], prompt_message_id: 'prompt-1', is_final: true }];

        (messageService.useChatSession as jest.Mock).mockReturnValue({
            ...mockUseChatSession,
            messages: existingMessages,
        });

        (ablyService.useAbly as jest.Mock).mockReturnValue({
            ...mockUseAbly,
            partials,
        });

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        // Should not add duplicate message
        const setMessagesCall = (mockUseChatSession.setMessages.mock.calls[0] as unknown[])[0] as (
            messages: ChatMessage[]
        ) => ChatMessage[];
        const result = setMessagesCall(existingMessages);
        expect(result).toEqual(existingMessages);
    });

    test('updates existing streaming message with new partials', async () => {
        const existingStreamingMessage: ChatMessageResponse = {
            id: 'streaming-1',
            ordinalId: 'ord-1',
            type: ChatMessageType.RESPONSE,
            status: ChatMessageStatus.STREAMING,
            prompt: 'Test',
            timestamp: new Date().toISOString(),
            blocks: [
                {
                    id: 'block-1',
                    type: BlockType.TEXT,
                    content: 'Initial',
                },
            ],
            sources: [],
        };

        const partials = [{ blocks: [{ content: 'Updated content' }], is_final: false }];

        (messageService.useChatSession as jest.Mock).mockReturnValue({
            ...mockUseChatSession,
            messages: [existingStreamingMessage],
        });

        (ablyService.useAbly as jest.Mock).mockReturnValue({
            ...mockUseAbly,
            partials,
        });

        await actAndFlush(() => renderWithProvider(<Messages onOpenSources={jest.fn()} onSubmit={jest.fn()} />));

        const setMessagesCall = (mockUseChatSession.setMessages.mock.calls[0] as unknown[])[0] as (
            messages: ChatMessage[]
        ) => ChatMessage[];
        const result = setMessagesCall([existingStreamingMessage]);

        expect((result[0] as ChatMessageResponse).blocks[0]?.content).toBe('Updated content');
        expect(result[0]?.status).toBe(ChatMessageStatus.STREAMING);
    });
});
