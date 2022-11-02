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
                onChangeCompany={onChange}
                onChangeTitle={onChange}
                selectedCompany={company}
                title="Recording Details Test"
            />
        );
        screen.getByText('Recording Details');
        screen.getByText('Enter the name of the recording');
        screen.getByText('Associate with a specific company');
    });
});
