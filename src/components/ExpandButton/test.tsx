import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithClient } from 'testUtils';
import { ExpandButton } from '.';

describe('ExpandButton', () => {
    test('renders', () => {
        const onClick = jest.fn();
        renderWithClient(<ExpandButton onClick={onClick} expanded />);
        const btn = screen.getByTitle('expand');
        fireEvent.click(btn);
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
