import React from 'react';
import { screen } from '@testing-library/react';

import { ContentListContent, ContentType } from '@aiera/client-sdk/modules/ContentList';
import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { Content } from '.';

const content: ContentListContent = {
    id: 1,
    date: '2021-10-21',
    companyIdentifier: 'GME',
    exchangeName: 'NYSE',
    sourceName: 'Benzinga',
    title: 'Famous Stonk Stonking Again As Retail Investors (aka Ape) Stop Eyeing the Moon and Shoot for Andromeda',
};

describe('Content', () => {
    test('renders content', () => {
        renderWithProvider(
            <Content
                companyIdentifier={content.companyIdentifier}
                contentType={ContentType.news}
                date={content.date}
                exchangeName={content.exchangeName}
                onBack={jest.fn()}
                sourceName={content.sourceName}
                title={content.title}
            />
        );
        screen.getByText('News');
        screen.getByText('GME');
        screen.getByText('NYSE');
        screen.getByText('Famous Stonk', { exact: false });
        screen.getByText('Benzinga');
        screen.getByText('Oct 21, 2021');
        screen.getByText('Netflix, Inc.', { exact: false });
    });
});
