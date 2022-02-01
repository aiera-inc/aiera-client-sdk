import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { RecordingDetails } from './index';

describe('RecordingDetails', () => {
    test('renders', () => {
        renderWithProvider(<RecordingDetails />);
        screen.getByText('Recording Details');
    });
});
