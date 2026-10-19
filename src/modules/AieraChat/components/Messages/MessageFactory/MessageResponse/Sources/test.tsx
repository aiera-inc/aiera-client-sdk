import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import { Sources } from '.';
import { Source, useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { useConfig } from '@aiera/client-sdk/lib/config';
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

global.window.open = mockWindowOpen;

const transcriptSource: Source = { targetId: 'event-1', targetType: 'transcript', title: 'Earnings Call' };
const filingSource: Source = { targetId: 'filing-1', targetType: 'filing', title: 'Annual Report' };
const filingWithUrl: Source = {
    targetId: 'filing-2',
    targetType: 'filing',
    title: 'Quarterly Report',
    url: 'https://example.com/10q.pdf',
};
const attachmentSource: Source = { targetId: 'attachment-1', targetType: 'attachment', title: 'Slides' };

function mockUser(apiKeyPublic: string | null) {
    (useQuery as jest.Mock).mockReturnValue({
        state: { data: { currentUser: { id: 'user-123', apiKeyPublic } } },
    });
}

function renderExpanded(sources: Source[]) {
    render(<Sources sources={sources} />);
    fireEvent.click(screen.getByText('Sources Used'));
}

describe('Sources', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useChatStore.setState({
            onSelectSource: mockOnSelectSource,
            getCitationMarker: () => null,
        });
        (useMessageBus as jest.Mock).mockReturnValue({ emit: mockEmit });
        (useConfig as jest.Mock).mockReturnValue({ options: {}, restApiUrl: 'https://api.example.com' });
        mockUser('public-key');
    });

    test('selects a transcript source in-app', () => {
        renderExpanded([transcriptSource]);
        fireEvent.click(screen.getByText('Earnings Call'));
        expect(mockOnSelectSource).toHaveBeenCalledWith(transcriptSource);
        expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    test('opens the content PDF for a filing source using the public api key', () => {
        renderExpanded([filingSource]);
        fireEvent.click(screen.getByText('Annual Report'));
        expect(mockWindowOpen).toHaveBeenCalledWith(
            'https://api.example.com/content/filing-1/pdf?api_key=public-key',
            '_blank',
            'noopener,noreferrer'
        );
        expect(mockOnSelectSource).not.toHaveBeenCalled();
    });

    test('opens the url for a filing source when the user has no public api key', () => {
        mockUser(null);
        renderExpanded([filingWithUrl]);
        fireEvent.click(screen.getByText('Quarterly Report'));
        expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/10q.pdf', '_blank', 'noopener,noreferrer');
        expect(mockOnSelectSource).not.toHaveBeenCalled();
    });

    test('does nothing for a filing source with no public api key and no url', () => {
        mockUser(null);
        renderExpanded([filingSource]);
        fireEvent.click(screen.getByText('Annual Report'));
        expect(mockWindowOpen).not.toHaveBeenCalled();
        expect(mockOnSelectSource).not.toHaveBeenCalled();
    });

    test('does nothing for an attachment source with no public api key and no url', () => {
        mockUser(null);
        renderExpanded([attachmentSource]);
        fireEvent.click(screen.getByText('Slides'));
        expect(mockWindowOpen).not.toHaveBeenCalled();
        expect(mockOnSelectSource).not.toHaveBeenCalled();
    });

    test('emits on the message bus when source navigation is disabled', () => {
        (useConfig as jest.Mock).mockReturnValue({
            options: { aieraChatDisableSourceNav: true },
            restApiUrl: 'https://api.example.com',
        });
        renderExpanded([filingSource]);
        fireEvent.click(screen.getByText('Annual Report'));
        expect(mockEmit).toHaveBeenCalledWith('chat-source', filingSource, 'out');
        expect(mockOnSelectSource).not.toHaveBeenCalled();
        expect(mockWindowOpen).not.toHaveBeenCalled();
    });
});
