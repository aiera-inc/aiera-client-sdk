import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Input, InputUI } from '.';

describe('Input', () => {
    test('renders', () => {
        render(<Input name="input" defaultValue="test" placeholder="example" />);
        const inputEle = screen.getByPlaceholderText('example');
        fireEvent.change(inputEle, { target: { value: 'changed' } });
        expect(screen.getByPlaceholderText('example')).toHaveValue('changed');
    });
});

describe('InputUI', () => {
    test('renders', () => {
        render(<InputUI name="input" defaultValue="test" placeholder="example" />);
        const inputEle = screen.getByPlaceholderText('example');
        fireEvent.change(inputEle, { target: { value: 'changed' } });
        expect(screen.getByPlaceholderText('example')).toHaveValue('changed');
    });
});
