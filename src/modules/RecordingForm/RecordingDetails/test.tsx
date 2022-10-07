import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { RecordingDetails } from './index';

describe('RecordingDetails', () => {
    test('renders', () => {
        renderWithProvider(<RecordingDetails onChangeTitle={jest.fn()} title="Recording Details Test" />);
        screen.getByText('Recording Details');
        expect(screen.getByDisplayValue('Recording Details Test')).toBeInTheDocument();
    });
});
