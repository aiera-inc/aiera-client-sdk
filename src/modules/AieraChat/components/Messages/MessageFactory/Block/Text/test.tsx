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
        getCitationMarker: jest.fn((citation: Citation) => {
            // Mock implementation: create a simple marker based on contentId
            if (citation.contentId === 'test-content-id') return 'C1';
            if (citation.contentId === 'test-content-id-2') return 'C2';
            return null;
        }),
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
    const mockCitation2: Citation = {
        marker: '[c22]',
        source: 'Another Test Source',
        sourceId: 'test-source-id-2',
        text: 'Test citation text',
        contentId: 'test-content-id-2',
    };

    test('renders single citation marker correctly', () => {
        const content = 'This is a test with a citation [c2].';
        const citations = [mockCitation];

        render(<MarkdownRenderer content={content} citations={citations} />);

        const citationElements = screen.getAllByTestId('citation');
        expect(citationElements).toHaveLength(1);
        expect(citationElements[0]).toHaveTextContent('C1');
    });

    test('renders multiple identical citation markers correctly', () => {
        const content = 'First citation [c2] and second citation [c22].';
        const citations = [mockCitation, mockCitation2];

        render(<MarkdownRenderer content={content} citations={citations} />);

        const citationElements = screen.getAllByTestId('citation');
        expect(citationElements).toHaveLength(2);
        expect(citationElements[0]).toHaveTextContent('C1');
        expect(citationElements[1]).toHaveTextContent('C2');
    });

    test('renders multiple different citation markers correctly', () => {
        const content = 'First citation [c2] and second citation [c22].';
        const citations = [mockCitation, mockCitation2];

        render(<MarkdownRenderer content={content} citations={citations} />);

        const citationElements = screen.getAllByTestId('citation');
        expect(citationElements).toHaveLength(2);
        expect(citationElements[0]).toHaveTextContent('C1');
        expect(citationElements[1]).toHaveTextContent('C2');
    });

    test('handles redundant citation markers as described in issue', () => {
        const content =
            'Closing out 2024, we remain on track to fully complete the first 400 megawatts case of our Corsicana ' +
            'Facility by year-end. [c2] Driven by longer lead times on substation equipment for Corsicana now expect ' +
            '2 buildings to come online in 2025 versus our previous expectation of 3 buildings pushing out some of ' +
            'the expected Kentucky expansion for 2025 into 2026 and 2027. [c2]';
        const citations = [mockCitation];

        render(<MarkdownRenderer content={content} citations={citations} />);

        const citationElements = screen.getAllByTestId('citation');
        expect(citationElements).toHaveLength(2);
        citationElements.forEach((element) => {
            expect(element).toHaveTextContent('C1');
        });
    });

    test('handles content without citations', () => {
        const content = 'This is plain text without any citations.';
        render(<MarkdownRenderer content={content} />);
        const citationElements = screen.queryAllByTestId('citation');
        expect(citationElements).toHaveLength(0);
    });
});
