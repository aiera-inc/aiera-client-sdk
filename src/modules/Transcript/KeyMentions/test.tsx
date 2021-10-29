import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithClient } from 'testUtils';
import { KeyMentions } from '.';

describe('KeyMentions', () => {
    test('renders', () => {
        const toggle = jest.fn();
        renderWithClient(<KeyMentions toggleKeyMentions={toggle} keyMentionsExpanded />);
        screen.getByText('Key Mentions');
    });
});
