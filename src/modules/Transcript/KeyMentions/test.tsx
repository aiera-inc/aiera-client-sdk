import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { KeyMentions } from '.';

describe('KeyMentions', () => {
    test('renders', () => {
        const toggle = jest.fn();
        renderWithProvider(<KeyMentions toggleKeyMentions={toggle} keyMentionsExpanded />);
        screen.getByText('Key Mentions');
    });
});
