import { actAndFlush } from '@aiera/client-sdk/testUtils';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Calendar } from '.';

describe('Calendar', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('renders Calendar Controls', async () => {
        await actAndFlush(() => render(<Calendar />));
        screen.getByText('Next');
        screen.getByText('Prev');
    });
});
