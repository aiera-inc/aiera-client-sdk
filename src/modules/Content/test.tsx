import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

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

function generateContent() {
    return (
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
}

describe('Content', () => {
    test('renders content', () => {
        renderWithProvider(generateContent());
        screen.getByText('News');
        screen.getByText('GME');
        screen.getByText('NYSE');
        screen.getByText('Famous Stonk', { exact: false });
        screen.getByText('Benzinga');
        screen.getByText('Oct 21, 2021');
        screen.getByText('Netflix, Inc.', { exact: false });
    });

    test('highlightedBody', () => {
        const { rendered } = renderWithProvider(generateContent());
        const searchInput = screen.getByPlaceholderText('Search News...');
        // When there's a search term but no matches, the body should not have any highlighted text
        fireEvent.change(searchInput, { target: { value: 'fitler' } });
        expect(rendered.container.querySelector('.bg-yellow-300')).toBeNull();
        // When there's a search term and at least one match, the body should have highlighted text
        fireEvent.change(searchInput, { target: { value: 'television' } });
        expect(rendered.container.querySelector('.bg-yellow-300')).not.toBeNull();
        // When there's no search term, the body should not have any highlighted text
        fireEvent.change(searchInput, { target: { value: '' } });
        expect(rendered.container.querySelector('.bg-yellow-300')).toBeNull();
    });
});
