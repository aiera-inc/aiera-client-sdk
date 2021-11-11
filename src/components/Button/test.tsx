import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
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
});
