import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import {
    ChatMessageType,
    ChatMessageStatus,
    ChatMessagePrompt,
    ChatMessageResponse,
    ChatMessageSources,
} from '../../../services/messages';
import { MessageFactory } from '.';
import { BlockType } from './Block';

interface MockMessagePromptProps {
    data: {
        id: string;
        prompt: string;
    };
}

jest.mock('./MessagePrompt', () => ({
    MessagePrompt: ({ data }: MockMessagePromptProps) => (
        <div data-testid="message-prompt">
            <span>{data.prompt}</span>
            <span data-testid="prompt-id">{data.id}</span>
        </div>
    ),
}));

interface MockMessageResponseProps {
    data: {
        blocks?: Array<{ content: string }>;
        status: string;
    };
    generatingResponse: boolean;
    isLastItem: boolean;
}

jest.mock('./MessageResponse', () => ({
    MessageResponse: ({ data, generatingResponse, isLastItem }: MockMessageResponseProps) => (
        <div data-testid="message-response">
            <span>{data.blocks?.[0]?.content}</span>
            <span data-testid="response-status">{data.status}</span>
            <span data-testid="generating">{generatingResponse ? 'generating' : 'not-generating'}</span>
            <span data-testid="is-last">{isLastItem ? 'last' : 'not-last'}</span>
        </div>
    ),
}));

interface MockSourcesResponseProps {
    data: {
        sources?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
        promptMessageId: string;
        confirmed?: boolean;
    };
    onConfirm: (promptMessageId: string, sources: any[]) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

jest.mock('./SourcesResponse', () => ({
    SourcesResponse: ({ data, onConfirm }: MockSourcesResponseProps) => (
        <div data-testid="sources-response">
            <span>{data.sources?.length} sources</span>
            <button onClick={() => data.sources && onConfirm(data.promptMessageId, data.sources)}>Confirm</button>
            <span data-testid="confirmed">{data.confirmed ? 'confirmed' : 'not-confirmed'}</span>
        </div>
    ),
}));

describe('MessageFactory', () => {
    const mockSetRef = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders MessagePrompt for prompt type messages', () => {
        const promptMessage: ChatMessagePrompt = {
            id: 'prompt-123',
            ordinalId: 'ord-123',
            type: ChatMessageType.PROMPT,
            prompt: 'What is the weather?',
            status: ChatMessageStatus.COMPLETED,
            timestamp: '2023-01-01T00:00:00Z',
        };

        renderWithProvider(
            <MessageFactory
                message={promptMessage}
                generatingResponse={false}
                onConfirm={mockOnConfirm}
                setRef={mockSetRef}
            />
        );

        expect(screen.getByTestId('message-prompt')).toBeInTheDocument();
        expect(screen.getByText('What is the weather?')).toBeInTheDocument();
        expect(screen.getByTestId('prompt-id')).toHaveTextContent('prompt-123');
    });

    test('renders MessageResponse for response type messages', () => {
        const responseMessage: ChatMessageResponse = {
            id: 'response-123',
            ordinalId: 'ord-456',
            type: ChatMessageType.RESPONSE,
            prompt: 'What is the weather?',
            promptMessageId: 'prompt-123',
            status: ChatMessageStatus.COMPLETED,
            timestamp: '2023-01-01T00:00:00Z',
            blocks: [
                {
                    id: 'block-1',
                    type: BlockType.TEXT,
                    content: 'The weather is sunny today.',
                },
            ],
            sources: [],
        };

        renderWithProvider(
            <MessageFactory
                message={responseMessage}
                generatingResponse={false}
                onConfirm={mockOnConfirm}
                setRef={mockSetRef}
            />
        );

        expect(screen.getByTestId('message-response')).toBeInTheDocument();
        expect(screen.getByText('The weather is sunny today.')).toBeInTheDocument();
        expect(screen.getByTestId('response-status')).toHaveTextContent('completed');
    });

    test('renders SourcesResponse for sources type messages', () => {
        const sourcesMessage: ChatMessageSources = {
            id: 'sources-123',
            ordinalId: 'ord-789',
            type: ChatMessageType.SOURCES,
            prompt: 'Find information about AI',
            promptMessageId: 'prompt-123',
            status: ChatMessageStatus.COMPLETED,
            timestamp: '2023-01-01T00:00:00Z',
            sources: [
                { targetId: 'source-1', targetType: 'event', title: 'AI Conference' },
                { targetId: 'source-2', targetType: 'news', title: 'AI News Article' },
            ],
            confirmed: false,
        };

        renderWithProvider(
            <MessageFactory
                message={sourcesMessage}
                generatingResponse={false}
                onConfirm={mockOnConfirm}
                setRef={mockSetRef}
            />
        );

        expect(screen.getByTestId('sources-response')).toBeInTheDocument();
        expect(screen.getByText('2 sources')).toBeInTheDocument();
        expect(screen.getByTestId('confirmed')).toHaveTextContent('not-confirmed');
    });

    test('passes generatingResponse prop correctly to MessageResponse', () => {
        const responseMessage: ChatMessageResponse = {
            id: 'response-123',
            ordinalId: 'ord-456',
            type: ChatMessageType.RESPONSE,
            prompt: 'Question',
            status: ChatMessageStatus.STREAMING,
            timestamp: '2023-01-01T00:00:00Z',
            blocks: [
                {
                    id: 'block-1',
                    type: BlockType.TEXT,
                    content: 'Streaming...',
                },
            ],
            sources: [],
        };

        renderWithProvider(
            <MessageFactory
                message={responseMessage}
                generatingResponse={true}
                onConfirm={mockOnConfirm}
                setRef={mockSetRef}
            />
        );

        expect(screen.getByTestId('generating')).toHaveTextContent('generating');
        expect(screen.getByTestId('is-last')).toHaveTextContent('last');
    });

    test('indicates when message is not last item', () => {
        const responseMessage: ChatMessageResponse = {
            id: 'response-123',
            ordinalId: 'ord-456',
            type: ChatMessageType.RESPONSE,
            prompt: 'Question',
            status: ChatMessageStatus.COMPLETED,
            timestamp: '2023-01-01T00:00:00Z',
            blocks: [
                {
                    id: 'block-1',
                    type: BlockType.TEXT,
                    content: 'Answer',
                },
            ],
            sources: [],
        };

        const nextMessage: ChatMessagePrompt = {
            id: 'prompt-456',
            ordinalId: 'ord-789',
            type: ChatMessageType.PROMPT,
            prompt: 'Another question',
            status: ChatMessageStatus.COMPLETED,
            timestamp: '2023-01-01T00:01:00Z',
        };

        renderWithProvider(
            <MessageFactory
                message={responseMessage}
                nextMessage={nextMessage}
                generatingResponse={true}
                onConfirm={mockOnConfirm}
                setRef={mockSetRef}
            />
        );

        expect(screen.getByTestId('generating')).toHaveTextContent('not-generating');
        expect(screen.getByTestId('is-last')).toHaveTextContent('not-last');
    });

    test('calls setRef with correct element and id', () => {
        const promptMessage: ChatMessagePrompt = {
            id: 'prompt-unique-123',
            ordinalId: 'ord-123',
            type: ChatMessageType.PROMPT,
            prompt: 'Test prompt',
            status: ChatMessageStatus.COMPLETED,
            timestamp: '2023-01-01T00:00:00Z',
        };

        renderWithProvider(
            <MessageFactory
                message={promptMessage}
                generatingResponse={false}
                onConfirm={mockOnConfirm}
                setRef={mockSetRef}
            />
        );

        // Check that setRef was called with the container div and message id
        expect(mockSetRef).toHaveBeenCalledWith(expect.any(HTMLDivElement), 'prompt-unique-123');
    });

    test('handles sources confirmation callback', () => {
        const sourcesMessage: ChatMessageSources = {
            id: 'sources-123',
            ordinalId: 'ord-789',
            type: ChatMessageType.SOURCES,
            prompt: 'Find sources',
            promptMessageId: 'prompt-123',
            status: ChatMessageStatus.COMPLETED,
            timestamp: '2023-01-01T00:00:00Z',
            sources: [{ targetId: 'source-1', targetType: 'event', title: 'Event 1' }],
            confirmed: false,
        };

        renderWithProvider(
            <MessageFactory
                message={sourcesMessage}
                generatingResponse={false}
                onConfirm={mockOnConfirm}
                setRef={mockSetRef}
            />
        );

        const confirmButton = screen.getByText('Confirm');
        confirmButton.click();

        expect(mockOnConfirm).toHaveBeenCalledWith('prompt-123', [
            { targetId: 'source-1', targetType: 'event', title: 'Event 1' },
        ]);
    });

    test('applies correct CSS classes to container', () => {
        const promptMessage: ChatMessagePrompt = {
            id: 'prompt-123',
            ordinalId: 'ord-123',
            type: ChatMessageType.PROMPT,
            prompt: 'Test',
            status: ChatMessageStatus.COMPLETED,
            timestamp: '2023-01-01T00:00:00Z',
        };

        renderWithProvider(
            <MessageFactory
                message={promptMessage}
                generatingResponse={false}
                onConfirm={mockOnConfirm}
                setRef={mockSetRef}
            />
        );

        // The message container is the parent of the prompt
        const promptElement = screen.getByTestId('message-prompt');
        const messageContainer = promptElement.parentElement;
        expect(messageContainer).toHaveClass('flex', 'flex-col', 'max-w-[50rem]', 'w-full', 'm-auto');
    });

    test('handles streaming response message', () => {
        const streamingMessage: ChatMessageResponse = {
            id: 'response-stream',
            ordinalId: 'ord-stream',
            type: ChatMessageType.RESPONSE,
            prompt: 'Question',
            status: ChatMessageStatus.STREAMING,
            timestamp: '2023-01-01T00:00:00Z',
            blocks: [
                {
                    id: 'block-1',
                    type: BlockType.TEXT,
                    content: 'Streaming content...',
                },
            ],
            sources: [],
        };

        renderWithProvider(
            <MessageFactory
                message={streamingMessage}
                generatingResponse={true}
                onConfirm={mockOnConfirm}
                setRef={mockSetRef}
            />
        );

        expect(screen.getByTestId('response-status')).toHaveTextContent('streaming');
        expect(screen.getByTestId('generating')).toHaveTextContent('generating');
    });

    test('handles confirmed sources message', () => {
        const confirmedSourcesMessage: ChatMessageSources = {
            id: 'sources-confirmed',
            ordinalId: 'ord-confirmed',
            type: ChatMessageType.SOURCES,
            prompt: 'Find sources',
            promptMessageId: 'prompt-123',
            status: ChatMessageStatus.COMPLETED,
            timestamp: '2023-01-01T00:00:00Z',
            sources: [{ targetId: 'source-1', targetType: 'event', title: 'Event 1', confirmed: true }],
            confirmed: true,
        };

        renderWithProvider(
            <MessageFactory
                message={confirmedSourcesMessage}
                generatingResponse={false}
                onConfirm={mockOnConfirm}
                setRef={mockSetRef}
            />
        );

        expect(screen.getByTestId('confirmed')).toHaveTextContent('confirmed');
    });
});
