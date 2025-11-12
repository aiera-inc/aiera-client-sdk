import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import { Citation } from '.';
import { useChatStore } from '../../../../store';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import { useQuery } from '@aiera/client-sdk/api/client';

jest.mock('@aiera/client-sdk/lib/msg', () => ({
    useMessageBus: jest.fn(),
}));

jest.mock('@aiera/client-sdk/lib/config', () => ({
    useConfig: jest.fn(() => ({ options: {}, restApiUrl: 'https://api.example.com' })),
}));

jest.mock('@aiera/client-sdk/api/client', () => ({
    useQuery: jest.fn(),
}));

const mockOnSelectSource = jest.fn();
const mockEmit = jest.fn();
const mockWindowOpen = jest.fn();

// Mock window.open
global.window.open = mockWindowOpen;

describe('Citation', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Reset store
        useChatStore.setState({
            onSelectSource: mockOnSelectSource,
        });

        // Setup default mocks
        (useMessageBus as jest.Mock).mockReturnValue({
            emit: mockEmit,
        });

        (useConfig as jest.Mock).mockReturnValue({
            options: {},
            restApiUrl: 'https://api.example.com',
        });

        (useQuery as jest.Mock).mockReturnValue({
            state: {
                data: {
                    currentUser: {
                        id: 'user-123',
                        apiKey: 'test-api-key',
                    },
                },
            },
        });
    });

    test('renders citation marker', () => {
        const citation: CitationType = {
            marker: 'T1',
            source: 'Test Source',
            sourceId: 'source-123',
            sourceType: 'transcript',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        render(<Citation citation={citation} />);

        expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('handles click on event type citation', () => {
        const citation: CitationType = {
            marker: 'E1',
            source: 'Earnings Call Q3 2023',
            sourceId: 'event-123',
            sourceParentId: 'parent-123',
            sourceType: 'event',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        expect(mockOnSelectSource).toHaveBeenCalledWith({
            contentId: 'content-123',
            targetId: 'parent-123', // Uses parentId when available
            targetType: 'event',
            title: 'Earnings Call Q3 2023',
        });
    });

    test('handles click on transcript type citation', () => {
        const citation: CitationType = {
            marker: 'T1',
            source: 'Transcript Source',
            sourceId: 'transcript-123',
            sourceType: 'transcript',
            contentId: 'content-456',
            text: 'Test citation text',
        };

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        expect(mockOnSelectSource).toHaveBeenCalledWith({
            contentId: 'content-456',
            targetId: 'transcript-123', // Falls back to sourceId when no parentId
            targetType: 'event',
            title: 'Transcript Source',
        });
    });

    test('opens URL when citation has URL', () => {
        const citation: CitationType = {
            marker: 'N1',
            source: 'News Article',
            sourceId: 'news-123',
            sourceType: 'news',
            contentId: 'content-123',
            url: 'https://example.com/news/article',
            text: 'Test citation text',
        };

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        expect(mockWindowOpen).toHaveBeenCalledWith(
            'https://example.com/news/article',
            '_blank',
            'noopener,noreferrer'
        );
        expect(mockOnSelectSource).not.toHaveBeenCalled();
    });

    test('opens attachment URL for attachment type', () => {
        const citation: CitationType = {
            marker: 'A1',
            source: 'Presentation Slides',
            sourceId: 'attachment-123',
            sourceParentId: 'event-456',
            sourceType: 'attachment',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        expect(mockWindowOpen).toHaveBeenCalledWith(
            'https://api.example.com/content/attachment-123/pdf?api_key=test-api-key',
            '_blank',
            'noopener,noreferrer'
        );
    });

    test('opens filing URL for filing type', () => {
        const citation: CitationType = {
            marker: 'F1',
            source: '10-K Filing',
            sourceId: 'filing-789',
            sourceType: 'filing',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        expect(mockWindowOpen).toHaveBeenCalledWith(
            'https://api.example.com/content/filing-789/pdf?api_key=test-api-key',
            '_blank',
            'noopener,noreferrer'
        );
    });

    test('emits message bus event when source navigation is disabled', () => {
        const citation: CitationType = {
            marker: 'E1',
            source: 'Event Source',
            sourceId: 'event-123',
            sourceType: 'event',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        (useConfig as jest.Mock).mockReturnValue({
            options: { aieraChatDisableSourceNav: true },
            restApiUrl: 'https://api.example.com',
        });

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        expect(mockEmit).toHaveBeenCalledWith('chat-citation', citation, 'out');
        expect(mockOnSelectSource).not.toHaveBeenCalled();
        expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    test('does not open URL if no restApiUrl configured for attachment', () => {
        const citation: CitationType = {
            marker: 'A1',
            source: 'Attachment',
            sourceId: 'attachment-123',
            sourceParentId: 'event-456',
            sourceType: 'attachment',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        (useConfig as jest.Mock).mockReturnValue({
            options: {},
            restApiUrl: undefined,
        });

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    test('does not open URL if no userApiKey available for attachment', () => {
        const citation: CitationType = {
            marker: 'A1',
            source: 'Attachment',
            sourceId: 'attachment-123',
            sourceParentId: 'event-456',
            sourceType: 'attachment',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        (useQuery as jest.Mock).mockReturnValue({
            state: {
                data: null,
            },
        });

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    test('does not emit if message bus is not available', () => {
        (useMessageBus as jest.Mock).mockReturnValue(null);

        const citation: CitationType = {
            marker: 'E1',
            source: 'Event',
            sourceId: 'event-123',
            sourceType: 'event',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        (useConfig as jest.Mock).mockReturnValue({
            options: { aieraChatDisableSourceNav: true },
            restApiUrl: 'https://api.example.com',
        });

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        // Should not throw error even when bus is null
        expect(mockEmit).not.toHaveBeenCalled();
    });

    test('applies correct CSS classes', () => {
        const citation: CitationType = {
            marker: 'T1',
            source: 'Test',
            sourceId: 'test-123',
            sourceType: 'transcript',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        const { container } = render(<Citation citation={citation} />);

        const citationElement = container.querySelector('.citation');
        expect(citationElement).toHaveClass('relative', 'inline-flex', 'items-center', 'h-3.5', 'ml-0.5');

        const markerElement = screen.getByText('1');
        expect(markerElement).toHaveClass(
            'flex',
            'h-3.5',
            'items-center',
            'leading-[10px]',
            'rounded',
            'bg-blue-700',
            'px-[3px]',
            'py-px',
            'text-xs',
            'font-bold',
            'tracking-tight',
            'text-white',
            'antialiased',
            'cursor-pointer',
            'hover:bg-yellow-500',
            'hover:text-black'
        );
    });

    test('handles citation with all optional fields', () => {
        const citation: CitationType = {
            marker: 'C1',
            source: 'Complex Source',
            sourceId: 'source-123',
            sourceParentId: 'parent-456',
            sourceType: 'custom',
            contentId: 'content-789',
            url: 'https://example.com/custom',
            text: 'Test citation text',
        };

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        // Should use URL when available, regardless of source type
        expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/custom', '_blank', 'noopener,noreferrer');
    });

    test('does not trigger any action for unknown source types without URL', () => {
        const citation: CitationType = {
            marker: 'U1',
            source: 'Unknown Source',
            sourceId: 'unknown-123',
            sourceType: 'unknown',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        expect(mockOnSelectSource).not.toHaveBeenCalled();
        expect(mockWindowOpen).not.toHaveBeenCalled();
        expect(mockEmit).not.toHaveBeenCalled();
    });

    test('handles attachment with sourceId', () => {
        const citation: CitationType = {
            marker: 'A1',
            source: 'Attachment without parent',
            sourceId: 'attachment-123',
            sourceType: 'attachment',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        // Should open URL using sourceId
        expect(mockWindowOpen).toHaveBeenCalledWith(
            'https://api.example.com/content/attachment-123/pdf?api_key=test-api-key',
            '_blank',
            'noopener,noreferrer'
        );
    });

    test('opens URL for filing with empty sourceId when restApiUrl and userApiKey are available', () => {
        const citation: CitationType = {
            marker: 'F1',
            source: 'Filing without ID',
            sourceId: '',
            sourceType: 'filing',
            contentId: 'content-123',
            text: 'Test citation text',
        };

        render(<Citation citation={citation} />);

        fireEvent.click(screen.getByText('1'));

        // The condition checks for POP_OUT_SOURCE_TYPES.includes(sourceType) && userApiKey && API_URL && API_URL !== 'undefined'
        // It doesn't check if sourceId is truthy, so it will still construct and open the URL
        expect(mockWindowOpen).toHaveBeenCalledWith(
            'https://api.example.com/content//pdf?api_key=test-api-key',
            '_blank',
            'noopener,noreferrer'
        );
    });
});
