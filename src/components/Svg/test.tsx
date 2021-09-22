import React from 'react';
import { render, screen } from '@testing-library/react';

import { Svg } from '.';

describe('Svg', () => {
    test('renders', () => {
        render(<Svg alt="My SVG" src="my.svg" />);
        screen.getByText('My SVG');
    });
});
