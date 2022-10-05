import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { Troubleshooting } from './index';

describe('Troubleshooting', () => {
    const onChange = jest.fn();

    test('renders', () => {
        renderWithProvider(
            <Troubleshooting
                isWebcast
                onChangeOnFailure={onChange}
                onChangeOnFailureDialNumber={onChange}
                onChangeOnFailureSmsNumber={onChange}
            />
        );
        screen.getByText('Troubleshooting');
    });

    test('when isWebcast is true, render webcast troubleshooting options', () => {
        renderWithProvider(
            <Troubleshooting
                isWebcast
                onChangeOnFailure={onChange}
                onChangeOnFailureDialNumber={onChange}
                onChangeOnFailureSmsNumber={onChange}
            />
        );
        screen.getByText('Attempt Aiera intervention');
        screen.getByText('Do nothing');
    });

    test('when isWebcast is false, render phone troubleshooting options', () => {
        renderWithProvider(
            <Troubleshooting
                isWebcast={false}
                onChangeOnFailure={onChange}
                onChangeOnFailureDialNumber={onChange}
                onChangeOnFailureSmsNumber={onChange}
            />
        );
        screen.getByText('Alert me by SMS');
        screen.getByText('Call me');
        screen.getByText('Do nothing');
    });
});
