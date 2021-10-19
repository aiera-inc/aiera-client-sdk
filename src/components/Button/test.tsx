import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithClient } from 'testUtils';
import { Button } from '.';

describe('Button', () => {
    test('renders', () => {
        renderWithClient(<Button>ButtonUI</Button>);
        screen.getByText('ButtonUI');
    });

    test('onClick', () => {
        const handleClick = jest.fn();
        renderWithClient(<Button onClick={handleClick}>ButtonUI</Button>);
        const button = screen.getByText('ButtonUI');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
