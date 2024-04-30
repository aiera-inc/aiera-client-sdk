import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithProvider } from 'testUtils';
import { ReportIssue } from '.';

function onToggle() {
    return null;
}

describe('Report Issue', () => {
    test('renders', () => {
        renderWithProvider(<ReportIssue eventId="42342344" onToggle={onToggle} />);
        screen.getByText('Report Event Issue');
    });
});
