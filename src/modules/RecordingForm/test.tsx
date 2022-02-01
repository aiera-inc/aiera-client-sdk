import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { RecordingForm } from '.';

describe('RecordingForm', () => {
    test('renders', () => {
        renderWithProvider(<RecordingForm onBack={jest.fn()} />);
        screen.getByText('Recordings');
    });
});
