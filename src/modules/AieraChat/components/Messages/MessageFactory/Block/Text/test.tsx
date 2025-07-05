import React from 'react';
import { render, screen } from '@testing-library/react';
import { Citation } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import { MarkdownRenderer } from './markdown';

// Mock the citation component
jest.mock('@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Citation', () => ({
    Citation: ({ citation }: { citation: Citation }) => <span data-testid="citation">{citation.marker}</span>,
}));

// Mock the chat store
jest.mock('../../../../../store', () => ({
    useChatStore: () => ({
        onSelectSource: jest.fn(),
    }),
}));

describe('MarkdownRenderer', () => {
    const mockCitation: Citation = {
        marker: '[c2]',
        source: 'Test Source',
        sourceId: 'test-source-id',
        text: 'Test citation text',
        contentId: 'test-content-id',
    };

    test('renders single citation marker correctly', () => {
        const content = 'This is a test with a citation [c2].';
        const citations = [mockCitation];

        render(<MarkdownRenderer content={content} citations={citations} />);

        const citationElements = screen.getAllByTestId('citation');
        expect(citationElements).toHaveLength(1);
        expect(citationElements[0]).toHaveTextContent('[c2]');
    });

    test('renders multiple identical citation markers correctly', () => {
        const content = 'First citation [c2] and second citation [c2].';
        const citations = [mockCitation];

        render(<MarkdownRenderer content={content} citations={citations} />);

        const citationElements = screen.getAllByTestId('citation');
        expect(citationElements).toHaveLength(2);
        citationElements.forEach((element) => {
            expect(element).toHaveTextContent('[c2]');
        });
    });

    test('renders multiple different citation markers correctly', () => {
        const mockCitation2: Citation = {
            marker: '[c1]',
            source: 'Test Source 2',
            sourceId: 'test-source-id-2',
            text: 'Test citation text 2',
            contentId: 'test-content-id-2',
        };

        const content = 'First citation [c1] and second citation [c2].';
        const citations = [mockCitation, mockCitation2];

        render(<MarkdownRenderer content={content} citations={citations} />);

        const citationElements = screen.getAllByTestId('citation');
        expect(citationElements).toHaveLength(2);
        expect(citationElements[0]).toHaveTextContent('[c1]');
        expect(citationElements[1]).toHaveTextContent('[c2]');
    });

    test('handles redundant citation markers as described in issue', () => {
        const content =
            'Closing out 2024, we remain on track to fully complete the first 400 megawatts case of our Corsicana Facility by year-end. [c2] ' +
            'Driven by longer lead times on substation equipment for Corsicana now expect 2 buildings to come online in 2025 versus our previous expectation of 3 buildings pushing out some of the expected Kentucky expansion for 2025 into 2026 and 2027. [c2]';
        const citations = [mockCitation];

        render(<MarkdownRenderer content={content} citations={citations} />);

        const citationElements = screen.getAllByTestId('citation');
        expect(citationElements).toHaveLength(2);
        citationElements.forEach((element) => {
            expect(element).toHaveTextContent('[c2]');
        });
    });

    test('handles content without citations', () => {
        const content = 'This is plain text without any citations.';
        const citations: Citation[] = [];

        render(<MarkdownRenderer content={content} citations={citations} />);

        const citationElements = screen.queryAllByTestId('citation');
        expect(citationElements).toHaveLength(0);
    });
});
