import React from 'react';
import { render, screen } from '@testing-library/react';
import { AieraChat, AieraChatUI } from '.';

describe('AieraChat', () => {
    it('renders AieraChatUI', () => {
        render(<AieraChat />);
        expect(screen.getByText('My New Chat')).toBeInTheDocument();
    });
});

describe('AieraChatUI', () => {
    it('renders the header with correct title', () => {
        render(<AieraChatUI />);
        expect(screen.getByText('My New Chat')).toBeInTheDocument();
    });

    it('renders chat and footer placeholders', () => {
        render(<AieraChatUI />);
        expect(screen.getByText('chat')).toBeInTheDocument();
        expect(screen.getByText('footer')).toBeInTheDocument();
    });
});
