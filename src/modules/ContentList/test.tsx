import React from 'react';
import { render, screen } from '@testing-library/react';

import { ContentList } from '.';

describe('ContentList', () => {
    test('renders content tabs', () => {
        render(<ContentList />);
        screen.getByText('News');
        screen.getByText('Corp. Activity');
    });
});
