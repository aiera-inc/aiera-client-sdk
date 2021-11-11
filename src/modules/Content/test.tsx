import React from 'react';
// import { screen } from '@testing-library/react';

import { ContentType } from '@aiera/client-sdk/modules/ContentList';
import { renderWithClient } from 'testUtils';
import { Content } from '.';

describe('Content', () => {
    test('renders', () => {
        renderWithClient(<Content contentType={ContentType.news} />);
        // screen.getByText('ContentUI');
    });
});
