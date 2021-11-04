import React from 'react';
import { fireEvent } from '@testing-library/react';

import { renderWithClient } from 'testUtils';
import { Toggle } from '.';

describe('Toggle', () => {
    test('renders', () => {
        const toggleFn = jest.fn();
        const { rendered } = renderWithClient(<Toggle onChange={toggleFn} />);
        const toggleElement = rendered.container.querySelector('.toggle');
        if (toggleElement) fireEvent.click(toggleElement);
        expect(toggleFn).toHaveBeenCalledTimes(1);
    });
    test('renders true', () => {
        const toggleFn = jest.fn();
        const { rendered } = renderWithClient(<Toggle onChange={toggleFn} on={true} />);
        const toggleElement = rendered.container.querySelector('.toggle') as HTMLInputElement;
        expect(toggleElement.checked).toEqual(true);
    });
    test('renders false', () => {
        const toggleFn = jest.fn();
        const { rendered } = renderWithClient(<Toggle onChange={toggleFn} on={false} />);
        const toggleElement = rendered.container.querySelector('.toggle') as HTMLInputElement;
        expect(toggleElement.checked).toEqual(false);
    });
});
