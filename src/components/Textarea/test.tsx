import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '.';

describe('Textarea', () => {
    test('renders', () => {
        render(<Textarea name="input" value="test" placeholder="example" />);
        const inputEle = screen.getByPlaceholderText('example');
        expect(inputEle).toHaveValue('test');
    });

    test('onChange called', () => {
        const onChange = jest.fn();
        render(<Textarea name="input" value="test" placeholder="example" onChange={onChange} />);
        const inputEle = screen.getByPlaceholderText('example');
        fireEvent.change(inputEle, { target: { value: 'changed' } });
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { name: 'input', value: 'changed' });
    });

    test('onFocus called', () => {
        const onFocus = jest.fn();
        render(<Textarea name="input" value="test" placeholder="example" onFocus={onFocus} />);
        const inputEle = screen.getByPlaceholderText('example');
        fireEvent.focus(inputEle);
        expect(onFocus).toHaveBeenCalled();
    });

    test('can be auto focused', () => {
        const onFocus = jest.fn();
        render(<Textarea autoFocus name="input" value="test" placeholder="example" onFocus={onFocus} />);
        expect(onFocus).toHaveBeenCalled();
    });

    test('can be cleared', () => {
        const onChange = jest.fn();
        render(<Textarea name="input" value="test" placeholder="example" onChange={onChange} />);
        const inputEle = screen.getByPlaceholderText('example');
        userEvent.hover(inputEle);
        const clearButton = screen.getByTitle('Close');
        userEvent.click(clearButton);
        expect(onChange).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: 'input', value: '' }));
    });

    test('clear button can be skipped', () => {
        const onChange = jest.fn();
        render(<Textarea clearable={false} name="input" value="test" placeholder="example" onChange={onChange} />);
        const inputEle = screen.getByPlaceholderText('example');
        userEvent.hover(inputEle);
        expect(screen.queryByTitle('Close')).toBeNull();
    });
});
