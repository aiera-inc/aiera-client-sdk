import { ChatMessage, ChatMessageType } from './messages';

export interface MessageGroup {
    id: string;
    timestamp: string;
    messages: ChatMessage[];
}

/**
 * Groups flat messages into MessageGroup array using sequential processing
 */
export function groupMessages(messages: ChatMessage[]): MessageGroup[] {
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    // Sort messages by timestamp to ensure proper ordering
    const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const message of sortedMessages) {
        if (message.type === ChatMessageType.PROMPT) {
            // Start a new group for each prompt
            currentGroup = {
                id: message.id, // Use prompt ID as group ID
                timestamp: message.timestamp,
                messages: [message],
            };
            groups.push(currentGroup);
        } else if (currentGroup) {
            // Add to current group
            currentGroup.messages.push(message);

            // Update group timestamp to latest message
            currentGroup.timestamp = message.timestamp;
        }
        // If no currentGroup and it's not a prompt, skip the message (orphaned)
    }

    return groups;
}
