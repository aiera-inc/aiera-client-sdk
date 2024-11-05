import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { Sources } from './Sources';

describe('AieraChat', () => {
    it('Header render title', () => {
        render(
            <Header
                title="My New Chat"
                onOpenMenu={function (): void {
                    throw new Error('Function not implemented.');
                }}
                onOpenSources={function (): void {
                    throw new Error('Function not implemented.');
                }}
            />
        );
        expect(screen.getByText('My New Chat')).toBeInTheDocument();
    });
    it('Sources panel', () => {
        render(
            <Sources
                onClose={function (): void {
                    throw new Error('Function not implemented.');
                }}
            />
        );
        expect(screen.getByText('Sources')).toBeInTheDocument();
    });
});
