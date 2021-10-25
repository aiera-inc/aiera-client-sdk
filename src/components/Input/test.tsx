import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import { Input } from '.';

describe('Input', () => {
    test('renders', () => {
        render(<Input name="input" defaultValue="test" placeholder="example" />);
        const inputEle = screen.getByPlaceholderText('example');
        fireEvent.change(inputEle, { target: { value: 'changed' } });
        expect(screen.getByPlaceholderText('example')).toHaveValue('changed');
    });

    test('onChange called', () => {
        const onChange = jest.fn();
        render(<Input name="input" defaultValue="test" placeholder="example" onChange={onChange} />);
        const inputEle = screen.getByPlaceholderText('example');
        fireEvent.change(inputEle, { target: { value: 'changed' } });
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { name: 'input', value: 'changed' });
    });

    test('onFocus called', () => {
        const onFocus = jest.fn();
        render(<Input name="input" defaultValue="test" placeholder="example" onFocus={onFocus} />);
        const inputEle = screen.getByPlaceholderText('example');
        fireEvent.focus(inputEle);
        expect(onFocus).toHaveBeenCalled();
    });
});
