import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { ChatMessageType, ChatMessageStatus, ChatMessagePrompt, ChatMessageResponse } from '../../../services/messages';
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

describe('MessageFactory', () => {
    const mockSetRef = jest.fn();

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

        renderWithProvider(<MessageFactory message={promptMessage} generatingResponse={false} setRef={mockSetRef} />);

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

        renderWithProvider(<MessageFactory message={responseMessage} generatingResponse={false} setRef={mockSetRef} />);

        expect(screen.getByTestId('message-response')).toBeInTheDocument();
        expect(screen.getByText('The weather is sunny today.')).toBeInTheDocument();
        expect(screen.getByTestId('response-status')).toHaveTextContent('completed');
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

        renderWithProvider(<MessageFactory message={responseMessage} generatingResponse={true} setRef={mockSetRef} />);

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

        renderWithProvider(<MessageFactory message={promptMessage} generatingResponse={false} setRef={mockSetRef} />);

        // Check that setRef was called with the container div and message id
        expect(mockSetRef).toHaveBeenCalledWith(expect.any(HTMLDivElement), 'prompt-unique-123');
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

        renderWithProvider(<MessageFactory message={promptMessage} generatingResponse={false} setRef={mockSetRef} />);

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

        renderWithProvider(<MessageFactory message={streamingMessage} generatingResponse={true} setRef={mockSetRef} />);

        expect(screen.getByTestId('response-status')).toHaveTextContent('streaming');
        expect(screen.getByTestId('generating')).toHaveTextContent('generating');
    });
});
