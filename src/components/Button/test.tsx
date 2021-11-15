import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import { renderWithProvider } from 'testUtils';
import { Button } from '.';

describe('Button', () => {
    test('renders', () => {
        renderWithProvider(<Button>ButtonUI</Button>);
        screen.getByText('ButtonUI');
    });

    test('onClick', () => {
        const handleClick = jest.fn();
        renderWithProvider(<Button onClick={handleClick}>ButtonUI</Button>);
        const button = screen.getByText('ButtonUI');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('tab to focus button', () => {
        renderWithProvider(<Button>ButtonUI</Button>);
        const button = screen.getByText('ButtonUI');
        expect(button).not.toHaveFocus();
        userEvent.tab();
        expect(button).toHaveFocus();
    });
});
