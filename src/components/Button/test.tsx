import React from 'react';
import { render, screen } from '@testing-library/react';

import { renderWithClient } from 'testUtils';
import { Button, ButtonUI } from '.';

describe('ButtonUI', () => {
    test('renders UI', () => {
        render(<ButtonUI>ButtonUI</ButtonUI>);
        screen.getByText('ButtonUI');
    });
});

describe('Button', () => {
    test('renders', () => {
        renderWithClient(<Button>ButtonUI</Button>);
        screen.getByText('ButtonUI');
    });
});
