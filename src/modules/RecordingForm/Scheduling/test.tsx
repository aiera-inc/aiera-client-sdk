import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { Scheduling } from './index';

describe('Scheduling', () => {
    const onChange = jest.fn();
    test('renders scheduling fields', () => {
        renderWithProvider(<Scheduling onChangeScheduleDate={onChange} onChangeScheduleType={onChange} />);
        screen.getByText('Scheduling');
        screen.getByText('Now');
        screen.getByText('In the future');
    });
});
