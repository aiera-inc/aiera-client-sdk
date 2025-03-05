import { ChatMessageStatus, ChatMessageType } from '@aiera/client-sdk/modules/AieraChat/services/messages';
import { Source } from '@aiera/client-sdk/modules/AieraChat/store';
import { ChatSessionStatus } from '@aiera/client-sdk/types';

export interface ChatSession {
    createdAt: string;
    id: string;
    sources?: Source[];
    status: ChatSessionStatus;
    title: string | null;
    updatedAt: string;
    userId: string;
}

export interface ChatSessionWithPromptMessage extends ChatSession {
    promptMessage?: {
        id: string;
        ordinalId?: string | null;
        prompt: string;
        status: ChatMessageStatus;
        timestamp: string;
        type: ChatMessageType;
    };
}
