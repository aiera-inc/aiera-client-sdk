import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { Troubleshooting } from './index';

describe('Troubleshooting', () => {
    const onChange = jest.fn();

    test('renders', () => {
        renderWithProvider(<Troubleshooting onChangeOnFailure={onChange} />);
        screen.getByText('Troubleshooting');
    });
});
