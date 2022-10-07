import React from 'react';
import { screen } from '@testing-library/react';

import { OnFailure } from '@aiera/client-sdk/modules/RecordingForm/types';
import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { Troubleshooting } from './index';

const mockFn = jest.fn();
jest.mock('react-phone-number-input', () => ({
    __esModule: true,
    default: mockFn,
}));

describe('Troubleshooting', () => {
    const onChange = jest.fn();
    const props = {
        hasAieraInterventionPermission: false,
        isWebcast: true,
        onChangeOnFailure: onChange,
        onChangeOnFailureDialNumber: onChange,
        onChangeOnFailureInstructions: onChange,
        onChangeOnFailureSmsNumber: onChange,
        onFailure: OnFailure.ManualInterventionCall,
        toggleAieraInterventionPermission: onChange,
    };

    test('renders', () => {
        renderWithProvider(<Troubleshooting {...props} />);
        screen.getByText('Troubleshooting');
    });

    test('when isWebcast is true, render webcast troubleshooting options', () => {
        renderWithProvider(<Troubleshooting {...props} />);
        screen.getByText('Attempt Aiera intervention');
        screen.getByText('Do nothing');
    });

    test('when isWebcast is false, render phone troubleshooting options', () => {
        renderWithProvider(<Troubleshooting {...props} isWebcast={false} />);
        screen.getByText('Alert me by SMS');
        screen.getByText('Call me');
        screen.getByText('Do nothing');
    });

    test('when onFailure is call or sms, render phone number input', () => {
        renderWithProvider(<Troubleshooting {...props} isWebcast={false} />);
        screen.getByText('Your phone number');
        expect(mockFn).toHaveBeenCalled();
    });

    test('when onFailure is Aiera intervention, render instructions input and permission checkbox', () => {
        renderWithProvider(<Troubleshooting {...props} isWebcast={true} onFailure={OnFailure.AieraIntervention} />);
        screen.getByText('Instructions');
        screen.getByText('Confirm that Aiera agents have permission', { exact: false });
        screen.getByPlaceholderText('Passwords or other useful information');
    });
});
