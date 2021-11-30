import React from 'react';
import { fireEvent } from '@testing-library/react';

import { actAndFlush, renderWithProvider } from 'testUtils';
import { Toggle } from '.';

describe('Toggle', () => {
    test('renders', async () => {
        const toggleFn = jest.fn();
        const { rendered } = await actAndFlush(() => renderWithProvider(<Toggle onChange={toggleFn} />));
        const toggleElement = rendered.container.querySelector('.toggle');
        if (toggleElement) fireEvent.click(toggleElement);
        expect(toggleFn).toHaveBeenCalledTimes(1);
    });
    test('renders true', async () => {
        const toggleFn = jest.fn();
        const { rendered } = await actAndFlush(() => renderWithProvider(<Toggle onChange={toggleFn} on={true} />));
        const toggleElement = rendered.container.querySelector('.toggle') as HTMLInputElement;
        expect(toggleElement.checked).toEqual(true);
    });
    test('renders false', async () => {
        const toggleFn = jest.fn();
        const { rendered } = await actAndFlush(() => renderWithProvider(<Toggle onChange={toggleFn} on={false} />));
        const toggleElement = rendered.container.querySelector('.toggle') as HTMLInputElement;
        expect(toggleElement.checked).toEqual(false);
    });
});
