import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { OnFailure } from '@aiera/client-sdk/modules/RecordingForm/types';
import { actAndFlush, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { Troubleshooting } from './index';

describe('Troubleshooting', () => {
    const onChange = jest.fn();
    const props = {
        errors: {},
        hasAieraInterventionPermission: false,
        isWebcast: true,
        onBlur: onChange,
        onChange,
        onFailure: OnFailure.ManualInterventionCall,
    };

    test('renders', async () => {
        await actAndFlush(() => renderWithProvider(<Troubleshooting {...props} />));
        screen.getByText('Troubleshooting');
    });

    test('when isWebcast is true, render webcast troubleshooting options', async () => {
        await actAndFlush(() => renderWithProvider(<Troubleshooting {...props} />));
        screen.getByText('Attempt Aiera intervention');
        screen.getByText('Do nothing');
    });

    test('when isWebcast is false, render phone troubleshooting options', async () => {
        await actAndFlush(() => renderWithProvider(<Troubleshooting {...props} isWebcast={false} />));
        screen.getByText('Alert me by SMS');
        screen.getByText('Call me');
        screen.getByText('Do nothing');
    });

    test('when onFailure is call or sms, render phone number input', async () => {
        await actAndFlush(() => renderWithProvider(<Troubleshooting {...props} isWebcast={false} />));
        screen.getByText('Your phone number');
    });

    test('when onFailure is Aiera intervention, render instructions input and permission checkbox', async () => {
        await actAndFlush(() =>
            renderWithProvider(<Troubleshooting {...props} isWebcast={true} onFailure={OnFailure.AieraIntervention} />)
        );
        screen.getByText('Instructions');
        screen.getByText('Confirm that Aiera agents have permission', { exact: false });
        screen.getByPlaceholderText('Passwords or other useful information');
    });

    test('when onFailure is call and onFailureDialNumber is not set, render an error', async () => {
        await actAndFlush(() =>
            renderWithProvider(
                <Troubleshooting {...props} errors={{ onFailureDialNumber: 'Required' }} isWebcast={false} />
            )
        );
        const callMeOption = await waitFor(() => screen.getByText('Call me'));
        await actAndFlush(() => {
            fireEvent.click(callMeOption);
        });
        await waitFor(() => screen.getByText('Your phone number'));
        await waitFor(() => screen.getByText('Required'));
    });

    test('when onFailure is sms and onFailureSmsNumber is not set, render an error', async () => {
        await actAndFlush(() =>
            renderWithProvider(
                <Troubleshooting
                    {...props}
                    errors={{ onFailureSmsNumber: 'Required' }}
                    isWebcast={false}
                    onFailure={OnFailure.ManualInterventionSms}
                />
            )
        );
        const smsOption = await waitFor(() => screen.getByText('Alert me by SMS'));
        await actAndFlush(() => {
            fireEvent.click(smsOption);
        });
        await waitFor(() => screen.getByText('Your phone number'));
        await waitFor(() => screen.getByText('Required'));
    });
});
