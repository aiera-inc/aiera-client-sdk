import React from 'react';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';

import { ContentList } from '.';

describe('ContentList', () => {
    test('renders tabs', () => {
        render(<ContentList />);
        screen.getByText('News');
        screen.getByText('Corp. Activity');
    });

    test('renders list', () => {
        render(<ContentList />);
        screen.getByText('GME');
        const row = screen.getByText('GME').closest('li');
        expect(row).toBeTruthy();
        if (row) {
            within(row).getByText('NYSE');
            within(row).getByText('Oct 21, 2021');
            within(row).getByText('Benzinga');
        }
    });
});
