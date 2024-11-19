import { fireEvent, render, screen } from '@testing-library/react';
import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import React, { createRef } from 'react';
import { Search } from '.';
import { Message } from '../../services/messages';

// Define the store state and methods type
interface ChatState {
    chatId: string | null;
    chatTitle?: string;
}

// Mock the store module
jest.mock('../../store', () => ({
    useChatStore: jest.fn(() => ({
        chatId: 'test-chat-id',
        chatTitle: 'Test Chat',
    })),
}));

describe('Search Component', () => {
    let mockStore: ChatState;
    const virtuosoRef = createRef<VirtuosoMessageListMethods<Message>>();

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        mockStore = {
            chatId: 'test-chat-id',
            chatTitle: 'Test Chat',
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (jest.requireMock('../../store').useChatStore as jest.Mock).mockImplementation(() => mockStore);
    });

    it('should initially render with chat title and search button', () => {
        render(<Search virtuosoRef={virtuosoRef} />);

        // Check if chat title input exists with correct value
        const titleInput = screen.getByDisplayValue('Test Chat');
        expect(titleInput).toBeInTheDocument();

        // Check if search button exists
        const searchButton = screen.getByRole('button');
        expect(searchButton).toBeInTheDocument();
    });

    it('should show search input when search button is clicked', () => {
        render(<Search virtuosoRef={virtuosoRef} />);

        // Click search button
        const searchButton = screen.getByRole('button');
        fireEvent.click(searchButton);

        // Check if search input appears
        const searchInput = screen.getByPlaceholderText('Search Chat...');
        expect(searchInput).toBeInTheDocument();

        // Check if it has autofocus
        expect(searchInput).toHaveFocus();
    });

    it('should show empty placeholder when chat title is null', () => {
        mockStore.chatId = null;
        mockStore.chatTitle = undefined;

        render(<Search virtuosoRef={virtuosoRef} />);

        // Check if placeholder is shown
        const titleInput = screen.getByPlaceholderText('Untitled Chat');
        expect(titleInput).toBeInTheDocument();
    });
});
