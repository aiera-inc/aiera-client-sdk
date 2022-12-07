import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { RecordingDetails } from './index';

const company = {
    id: '1',
    commonName: 'Name',
    instruments: [
        {
            id: '1',
            isPrimary: true,
            quotes: [
                {
                    id: '1',
                    isPrimary: true,
                    localTicker: 'TICK',
                    exchange: {
                        id: '1',
                        country: { id: '1', countryCode: 'US' },
                        shortName: 'EXCH',
                    },
                },
            ],
        },
    ],
};

describe('RecordingDetails', () => {
    const onChange = jest.fn();

    test('renders', () => {
        renderWithProvider(
            <RecordingDetails
                errors={{}}
                onBlur={onChange}
                onChange={onChange}
                selectedCompany={company}
                title="Recording Details Test"
            />
        );
        screen.getByText('Recording Details');
        screen.getByText('Enter the name of the recording');
        screen.getByText('Associate with a specific company');
        expect(screen.queryByDisplayValue('Recording Details Test')).toBeInTheDocument();
    });

    test('when title is not set, renders an error', () => {
        renderWithProvider(
            <RecordingDetails
                errors={{ title: 'Required' }}
                onBlur={onChange}
                onChange={onChange}
                selectedCompany={company}
            />
        );
        screen.getByText('Recording Details');
        screen.getByText('Enter the name of the recording');
        screen.getByText('Associate with a specific company');
        screen.getByText('Required');
    });
});
