import React from 'react';
import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import { AblyProvider } from 'ably/react';

import { actAndFlush, MockProvider, getMockedClient, getMockedRealtime } from '@aiera/client-sdk/testUtils';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import type { Config } from '@aiera/client-sdk/lib/config';
import { AieraChat } from '.';
import { useChatStore } from './store';
import type { ChatSession } from './services/types';

jest.mock('ably');
jest.mock('ably/react');

const mockCreateAblyRealtimeClient = jest.fn();
const mockSubscribeToChannel = jest.fn();
const mockUnsubscribeFromChannel = jest.fn();
const mockUseChatSessions = jest.fn();
const mockUseQuery = jest.fn();

jest.mock('./services/ably', () => ({
    CHANNEL_PREFIX: 'chat',
    useAbly: () => ({
        createAblyRealtimeClient: mockCreateAblyRealtimeClient,
        subscribeToChannel: mockSubscribeToChannel,
        unsubscribeFromChannel: mockUnsubscribeFromChannel,
    }),
}));

interface MockChatSessionsReturn {
    clearSources: jest.Mock;
    createSession: jest.Mock;
    deleteSession: jest.Mock;
    isLoading: boolean;
    sessions: ChatSession[];
    updateSession: jest.Mock;
    updateSessionTitleLocally: jest.Mock;
}

jest.mock('./services/chats', () => ({
    useChatSessions: (): MockChatSessionsReturn => mockUseChatSessions() as MockChatSessionsReturn,
}));

// Mock the useQuery hook from api/client to return a successful currentUser query
jest.mock('@aiera/client-sdk/api/client', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@aiera/client-sdk/api/client');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...actual,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        useQuery: (...args: any[]) => mockUseQuery(...args),
    };
});

interface MockHeaderProps {
    onChangeTitle: (title: string) => void;
    onOpenMenu: () => void;
}

jest.mock('./components/Header', () => ({
    Header: ({ onChangeTitle, onOpenMenu }: MockHeaderProps) => (
        <div data-testid="header">
            <button onClick={onOpenMenu}>Menu</button>
            <input data-testid="title-input" onChange={(e) => onChangeTitle(e.target.value)} />
        </div>
    ),
}));

interface MockMessagesProps {
    onOpenSources: () => void;
    onSubmit: (prompt: string) => void;
}

jest.mock('./components/Messages', () => ({
    Messages: ({ onOpenSources, onSubmit }: MockMessagesProps) => (
        <div data-testid="messages">
            <button onClick={onOpenSources}>Sources</button>
            <button onClick={() => onSubmit('test prompt')}>Submit</button>
        </div>
    ),
}));

interface MockMenuProps {
    isLoading: boolean;
    onClickIcon: (id: string) => void;
    onClose: () => void;
    sessions?: Array<{ id: string; title: string }>;
}

jest.mock('./panels/Menu', () => ({
    Menu: ({ isLoading, onClickIcon, onClose, sessions }: MockMenuProps) => (
        <div data-testid="menu">
            <button onClick={onClose}>Close Menu</button>
            {isLoading && <span>Loading...</span>}
            {sessions?.map((session) => (
                <div key={session.id}>
                    <span>{session.title}</span>
                    <button onClick={() => onClickIcon(session.id)}>Delete</button>
                </div>
            ))}
        </div>
    ),
}));

interface MockSourcesProps {
    onClearSources: () => void;
    onClose: () => void;
}

jest.mock('./panels/Sources', () => ({
    Sources: ({ onClearSources, onClose }: MockSourcesProps) => (
        <div data-testid="sources">
            <button onClick={onClose}>Close Sources</button>
            <button onClick={onClearSources}>Clear Sources</button>
        </div>
    ),
}));

interface MockConfirmDialogProps {
    onDelete: () => void;
    onClose: () => void;
}

jest.mock('./modals/ConfirmDialog', () => ({
    ConfirmDialog: ({ onDelete, onClose }: MockConfirmDialogProps) => (
        <div data-testid="confirm-dialog">
            <button onClick={onDelete}>Confirm Delete</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    ),
}));

interface MockTranscriptProps {
    eventId: string;
    onBack: () => void;
}

jest.mock('../Transcript', () => ({
    Transcript: ({ eventId, onBack }: MockTranscriptProps) => (
        <div data-testid="transcript">
            <span>Transcript for {eventId}</span>
            <button onClick={onBack}>Back</button>
        </div>
    ),
}));

const mockAblyClient = {
    connection: {
        state: 'connected',
        once: jest.fn((event: string, callback: () => void) => {
            if (event === 'connected') {
                // Simulate immediate connection
                callback();
            }
        }),
    },
    channels: {
        get: jest.fn(),
    },
};

const mockChannel = {
    name: 'test-channel',
    attach: jest.fn().mockResolvedValue(undefined),
    detach: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
};

describe('AieraChat', () => {
    interface RenderOptions {
        userId?: string;
        config?: {
            tracking?: { userId?: string };
            [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        };
        keepLoading?: boolean;
    }

    const renderAieraChat = async (options: RenderOptions = {}) => {
        const userId = options.userId || 'test-user';
        // Mock the currentUser query to return an authenticated user
        const currentUserData = {
            currentUser: {
                id: userId,
                firstName: 'Test',
                lastName: 'User',
                apiKey: 'test-api-key',
            },
        };

        mockUseQuery.mockReturnValue({
            status: 'success',
            data: currentUserData,
            state: {
                data: currentUserData,
                fetching: false,
                stale: false,
                error: undefined,
            },
            refetch: jest.fn(),
            isRefetching: false,
            isPaging: false,
        });

        // Create custom config with tracking.userId
        const customConfig = {
            assetPath: 'assets',
            platform: 'test',
            moduleName: 'AieraChat',
            tracking: { userId },
            gqlOptions: {
                clientOptions: {
                    url: 'test',
                },
            },
        } as unknown as Config;

        const renderResult = await actAndFlush(() => {
            const mockedClient = getMockedClient();
            const mockedRealtime = getMockedRealtime();
            const reset = jest.fn();
            const rendered = render(
                <MockProvider config={customConfig} client={mockedClient} realtime={mockedRealtime} reset={reset}>
                    <AieraChat />
                </MockProvider>
            );
            return {
                rendered,
                client: mockedClient,
                realtime: mockedRealtime,
                reset,
            };
        });

        // Advance timer to trigger the setTimeout
        jest.advanceTimersByTime(100);

        // Wait for the Ably client promise to resolve if not in loading state test
        if (!options.keepLoading) {
            await waitFor(() => {
                expect(mockCreateAblyRealtimeClient).toHaveBeenCalled();
            });

            // Wait a bit more for the component to render
            await waitFor(() => {
                expect(screen.queryByRole('status')).not.toBeInTheDocument();
            });
        }

        return renderResult.rendered;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Reset zustand store
        useChatStore.setState({
            chatId: 'new',
            chatStatus: ChatSessionStatus.Active,
            chatTitle: undefined,
            citationMarkers: new Map(),
            hasChanges: false,
            selectedSource: undefined,
            sources: [],
            sourceTypeCounters: new Map(),
        });

        // Default mock implementations
        mockCreateAblyRealtimeClient.mockResolvedValue(mockAblyClient);
        mockSubscribeToChannel.mockImplementation((channelName: string) => ({
            ...mockChannel,
            name: channelName,
        }));
        mockUnsubscribeFromChannel.mockResolvedValue(undefined);

        mockUseChatSessions.mockReturnValue({
            clearSources: jest.fn().mockResolvedValue(undefined),
            createSession: jest.fn().mockResolvedValue({ id: 'new-session-id', status: 'active', title: 'New Chat' }),
            deleteSession: jest.fn().mockResolvedValue(undefined),
            isLoading: false,
            sessions: [],
            updateSession: jest.fn().mockResolvedValue(undefined),
            updateSessionTitleLocally: jest.fn(),
        });

        (AblyProvider as jest.Mock).mockImplementation(({ children }: { children: React.ReactNode }) => (
            <>{children}</>
        ));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders loading spinner when Ably client is not ready', async () => {
        mockCreateAblyRealtimeClient.mockReturnValue(new Promise(() => undefined)); // Never resolves

        await renderAieraChat({ keepLoading: true });

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    });

    test('initializes Ably client with user ID from config', async () => {
        const mockUserId = 'test-user-123';

        await renderAieraChat({ userId: mockUserId });

        expect(mockCreateAblyRealtimeClient).toHaveBeenCalledWith(mockUserId);
    });

    test('renders main components when Ably client is ready', async () => {
        await renderAieraChat();

        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('messages')).toBeInTheDocument();
    });

    test('opens and closes menu panel', async () => {
        await renderAieraChat();

        // Menu should not be visible initially
        expect(screen.queryByTestId('menu')).not.toBeInTheDocument();

        // Open menu
        fireEvent.click(screen.getByText('Menu'));
        expect(screen.getByTestId('menu')).toBeInTheDocument();

        // Close menu
        fireEvent.click(screen.getByText('Close Menu'));
        expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
    });

    test('opens and closes sources panel', async () => {
        await renderAieraChat();

        // Sources should not be visible initially
        expect(screen.queryByTestId('sources')).not.toBeInTheDocument();

        // Open sources
        fireEvent.click(screen.getByText('Sources'));
        expect(screen.getByTestId('sources')).toBeInTheDocument();

        // Close sources
        fireEvent.click(screen.getByText('Close Sources'));
        expect(screen.queryByTestId('sources')).not.toBeInTheDocument();
    });

    test('creates new chat session on message submit', async () => {
        const mockCreateSession = jest.fn().mockResolvedValue({
            id: 'new-session-id',
            status: ChatSessionStatus.Active,
            title: 'New Chat',
            sources: [],
        });

        mockUseChatSessions.mockReturnValue({
            ...mockUseChatSessions(),
            createSession: mockCreateSession,
        });

        await renderAieraChat();

        // Submit a message
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(mockCreateSession).toHaveBeenCalledWith({
                prompt: 'test prompt',
                sources: [],
                title: undefined,
            });
        });

        // Check that chat was selected
        const state = useChatStore.getState();
        expect(state.chatId).toBe('new-session-id');
        expect(state.chatStatus).toBe(ChatSessionStatus.Active);
    });

    test('updates session title', async () => {
        const mockUpdateSession = jest.fn().mockResolvedValue(undefined);

        mockUseChatSessions.mockReturnValue({
            ...mockUseChatSessions(),
            updateSession: mockUpdateSession,
        });

        // Set initial chat state
        useChatStore.setState({
            chatId: 'existing-session',
            chatStatus: ChatSessionStatus.Active,
        });

        await renderAieraChat();

        // Update title
        const titleInput = screen.getByTestId('title-input');
        fireEvent.change(titleInput, { target: { value: 'New Title' } });

        await waitFor(() => {
            expect(mockUpdateSession).toHaveBeenCalledWith({
                sessionId: 'existing-session',
                title: 'New Title',
            });
        });
    });

    test('subscribes to title update channel for existing session', async () => {
        useChatStore.setState({
            chatId: 'existing-session',
            chatStatus: ChatSessionStatus.Active,
        });

        await renderAieraChat();

        expect(mockSubscribeToChannel).toHaveBeenCalledWith('chat:existing-session:title');
        expect(mockChannel.attach).toHaveBeenCalled();
    });

    test('handles title update from Ably channel', async () => {
        let messageHandler: ((message: { data: { title: string } }) => void) | undefined;
        mockChannel.subscribe.mockImplementation((handler: (message: { data: { title: string } }) => void) => {
            messageHandler = handler;
        });

        useChatStore.setState({
            chatId: 'existing-session',
            chatStatus: ChatSessionStatus.Active,
        });

        const mockUpdateSessionTitleLocally = jest.fn();
        mockUseChatSessions.mockReturnValue({
            ...mockUseChatSessions(),
            updateSessionTitleLocally: mockUpdateSessionTitleLocally,
        });

        await renderAieraChat();
        await waitFor(() => expect(mockChannel.subscribe).toHaveBeenCalled());

        // Simulate title update message
        if (messageHandler) {
            messageHandler({ data: { title: 'Updated Title' } });
        } else {
            throw new Error('messageHandler was not set during subscribe call');
        }

        const state = useChatStore.getState();
        expect(state.chatTitle).toBe('Updated Title');
        expect(mockUpdateSessionTitleLocally).toHaveBeenCalledWith('existing-session', 'Updated Title');
    });

    test('displays and handles transcript view for selected source', async () => {
        const mockSource = {
            targetId: 'event-123',
            targetType: 'event',
            title: 'Test Event',
            contentId: 'content-456',
        };

        useChatStore.setState({
            selectedSource: mockSource,
        });

        await renderAieraChat();

        expect(screen.getByText('Transcript for event-123')).toBeInTheDocument();

        // Test back button
        fireEvent.click(screen.getByText('Back'));

        // The animation class should be added
        const transcriptContainer = screen.getByTestId('transcript').parentElement;
        expect(transcriptContainer).toHaveClass('slideOutToRight');
    });

    test('confirms and deletes chat session', async () => {
        const mockDeleteSession = jest.fn().mockResolvedValue(undefined);
        const sessions = [
            { id: 'session-1', title: 'Chat 1' },
            { id: 'session-2', title: 'Chat 2' },
        ];

        mockUseChatSessions.mockReturnValue({
            ...mockUseChatSessions(),
            deleteSession: mockDeleteSession,
            sessions,
        });

        useChatStore.setState({
            chatId: 'session-1',
            chatStatus: ChatSessionStatus.Active,
        });

        await renderAieraChat();

        // Open menu
        fireEvent.click(screen.getByText('Menu'));

        // Click delete on a session
        const deleteButtons = screen.getAllByText('Delete');
        const firstDeleteButton = deleteButtons[0];
        if (!firstDeleteButton) {
            throw new Error('No delete buttons found');
        }
        fireEvent.click(firstDeleteButton);

        // Confirm dialog should appear
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();

        // Confirm deletion
        fireEvent.click(screen.getByText('Confirm Delete'));

        await waitFor(() => {
            expect(mockDeleteSession).toHaveBeenCalledWith('session-1');
        });

        // Should start new chat since we deleted the current session
        const state = useChatStore.getState();
        expect(state.chatId).toBe('new');
    });

    test('clears sources when sources panel is closed with changes', async () => {
        const mockUpdateSession = jest.fn().mockResolvedValue(undefined);
        const mockSources = [{ targetId: 'source-1', targetType: 'event', title: 'Source 1' }];

        mockUseChatSessions.mockReturnValue({
            ...mockUseChatSessions(),
            updateSession: mockUpdateSession,
        });

        useChatStore.setState({
            chatId: 'existing-session',
            chatStatus: ChatSessionStatus.Active,
            hasChanges: true,
            sources: mockSources,
        });

        await renderAieraChat();

        // Open sources
        fireEvent.click(screen.getByText('Sources'));

        // Close sources with changes
        fireEvent.click(screen.getByText('Close Sources'));

        await waitFor(() => {
            expect(mockUpdateSession).toHaveBeenCalledWith({
                sessionId: 'existing-session',
                sources: mockSources,
            });
        });

        // hasChanges should be reset
        const state = useChatStore.getState();
        expect(state.hasChanges).toBe(false);
    });

    test('applies dark mode when configured', async () => {
        // Render with custom config
        const config: Config = {
            assetPath: 'assets',
            platform: 'embedded',
            moduleName: 'AieraChat',
            tracking: { userId: 'test-user' },
            options: { darkMode: true },
            gqlOptions: {
                clientOptions: {
                    url: '',
                },
            },
        };

        await actAndFlush(() => {
            const mockedClient = getMockedClient();
            const mockedRealtime = getMockedRealtime();
            const reset = jest.fn();

            render(
                <MockProvider config={config} client={mockedClient} realtime={mockedRealtime} reset={reset}>
                    <AieraChat />
                </MockProvider>
            );
        });

        // Advance timer to trigger the setTimeout
        jest.advanceTimersByTime(100);

        // Wait for the Ably client promise to resolve
        await waitFor(() => {
            expect(mockCreateAblyRealtimeClient).toHaveBeenCalled();
        });

        // Wait a bit more for the component to render
        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        // The dark class is applied to the main container with the 'aiera-chat' class
        const chatContainer = document.querySelector('.aiera-chat');
        expect(chatContainer).toHaveClass('dark');
        expect(chatContainer).not.toHaveClass('bg-gray-50');
    });

    test('handles Ably client connection errors', async () => {
        mockCreateAblyRealtimeClient.mockRejectedValue(new Error('Connection failed'));

        await renderAieraChat({ keepLoading: true });

        // Should remain in loading state
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('cleans up Ably subscriptions on unmount', async () => {
        useChatStore.setState({
            chatId: 'existing-session',
            chatStatus: ChatSessionStatus.Active,
        });

        const result = await renderAieraChat();

        // Wait for subscription to happen
        await waitFor(() => {
            expect(mockSubscribeToChannel).toHaveBeenCalledWith('chat:existing-session:title');
        });

        result.unmount();

        expect(mockUnsubscribeFromChannel).toHaveBeenCalledWith('chat:existing-session:title');
    });

    test('handles clearing sources for existing session', async () => {
        const mockClearSources = jest.fn().mockResolvedValue(undefined);

        mockUseChatSessions.mockReturnValue({
            ...mockUseChatSessions(),
            clearSources: mockClearSources,
        });

        useChatStore.setState({
            chatId: 'existing-session',
            chatStatus: ChatSessionStatus.Active,
            sources: [{ targetId: 'source-1', targetType: 'event', title: 'Source 1' }],
        });

        await renderAieraChat();

        // Open sources panel
        fireEvent.click(screen.getByText('Sources'));

        // Clear sources
        fireEvent.click(screen.getByText('Clear Sources'));

        expect(mockClearSources).toHaveBeenCalledWith('existing-session');
    });

    test('does not update title for new chat', async () => {
        const mockUpdateSession = jest.fn();

        mockUseChatSessions.mockReturnValue({
            ...mockUseChatSessions(),
            updateSession: mockUpdateSession,
        });

        // Keep default state (chatId: 'new')

        await renderAieraChat();

        // Update title
        const titleInput = screen.getByTestId('title-input');
        fireEvent.change(titleInput, { target: { value: 'New Title' } });

        // Should not call updateSession for new chat
        expect(mockUpdateSession).not.toHaveBeenCalled();
    });
});
