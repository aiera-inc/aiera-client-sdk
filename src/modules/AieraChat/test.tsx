import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AieraChat, AieraChatUI } from '.';

// Mock the useConfig hook
jest.mock('@aiera/client-sdk/lib/config', () => ({
    useConfig: jest.fn(() => ({
        options: {
            darkMode: false,
        },
    })),
}));

describe('AieraChat Component', () => {
    it('renders AieraChatUI component', () => {
        render(<AieraChat />);
        expect(screen.getByText('chat')).toBeInTheDocument();
    });

    describe('AieraChatUI Component', () => {
        it('renders header, chat, and footer sections', () => {
            render(<AieraChatUI />);
            expect(screen.getByText('header')).toBeInTheDocument();
            expect(screen.getByText('chat')).toBeInTheDocument();
            expect(screen.getByText('footer')).toBeInTheDocument();
        });

        it('applies correct classes based on dark mode', () => {
            const { container } = render(<AieraChatUI />);
            const chatElement = container.firstChild;
            expect(chatElement).toHaveClass('aiera-chat');
            expect(chatElement).toHaveClass('bg-gray-50');
            expect(chatElement).not.toHaveClass('dark');
        });
    });
});
