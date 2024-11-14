import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Search } from '.';

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
        render(<Search />);

        // Check if chat title input exists with correct value
        const titleInput = screen.getByDisplayValue('Test Chat');
        expect(titleInput).toBeInTheDocument();

        // Check if search button exists
        const searchButton = screen.getByRole('button');
        expect(searchButton).toBeInTheDocument();
    });

    it('should show search input when search button is clicked', () => {
        render(<Search />);

        // Click search button
        const searchButton = screen.getByRole('button');
        fireEvent.click(searchButton);

        // Check if search input appears
        const searchInput = screen.getByPlaceholderText('Search Chat...');
        expect(searchInput).toBeInTheDocument();

        // Check if it has autofocus
        expect(searchInput).toHaveFocus();
    });

    it('should close search when escape key is pressed', () => {
        render(<Search />);

        // Open search
        const searchButton = screen.getByRole('button');
        fireEvent.click(searchButton);

        // Press escape
        const searchInput = screen.getByPlaceholderText('Search Chat...');
        fireEvent.keyDown(searchInput, { key: 'Escape' });

        // Check if we're back to title view
        const titleInput = screen.getByDisplayValue('Test Chat');
        expect(titleInput).toBeInTheDocument();
    });

    it('should show navigation controls when search term is entered', () => {
        render(<Search />);

        // Open search
        const searchButton = screen.getByRole('button');
        fireEvent.click(searchButton);

        // Enter search term
        const searchInput = screen.getByPlaceholderText('Search Chat...');
        fireEvent.change(searchInput, { target: { value: 'test' } });

        // Check if navigation controls appear
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('should close search when close button is clicked', () => {
        render(<Search />);

        // Open search
        const searchButton = screen.getByRole('button');
        fireEvent.click(searchButton);

        // Click close button
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        // Check if we're back to title view
        const titleInput = screen.getByDisplayValue('Test Chat');
        expect(titleInput).toBeInTheDocument();
    });

    it('should show empty placeholder when chat title is null', () => {
        mockStore.chatId = null;
        mockStore.chatTitle = undefined;

        render(<Search />);

        // Check if placeholder is shown
        const titleInput = screen.getByPlaceholderText('Untitled Chat');
        expect(titleInput).toBeInTheDocument();
    });
});
