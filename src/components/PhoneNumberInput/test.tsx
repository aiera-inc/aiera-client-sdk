import React from 'react';
import { screen } from '@testing-library/react';
import { actAndFlush, renderWithProvider } from 'testUtils';
import { PhoneNumberInput } from '.';

describe('PhoneNumberInput', () => {
    const onChange = jest.fn();
    const placeholder = '555-555-5555';

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllTimers();
    });

    test('renders', async () => {
        await actAndFlush(() => renderWithProvider(<PhoneNumberInput onChange={onChange} placeholder={placeholder} />));
        screen.getByPlaceholderText(placeholder);
    });
});
