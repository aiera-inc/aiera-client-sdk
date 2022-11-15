import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from '.';

describe('Input', () => {
    test('renders', () => {
        render(<Input name="input" value="test" placeholder="example" />);
        const inputEle = screen.getByPlaceholderText('example');
        expect(inputEle).toHaveValue('test');
    });

    test('onChange called', () => {
        const onChange = jest.fn();
        render(<Input name="input" value="test" placeholder="example" onChange={onChange} />);
        const inputEle = screen.getByPlaceholderText('example');
        fireEvent.change(inputEle, { target: { value: 'changed' } });
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { name: 'input', value: 'changed' });
    });

    test('onFocus called', () => {
        const onFocus = jest.fn();
        render(<Input name="input" value="test" placeholder="example" onFocus={onFocus} />);
        const inputEle = screen.getByPlaceholderText('example');
        fireEvent.focus(inputEle);
        expect(onFocus).toHaveBeenCalled();
    });

    test('can be auto focused', () => {
        const onFocus = jest.fn();
        render(<Input autoFocus name="input" value="test" placeholder="example" onFocus={onFocus} />);
        expect(onFocus).toHaveBeenCalled();
    });

    test('renders an icon if supplied', () => {
        render(
            <Input
                icon={
                    <svg>
                        <title>test icon</title>
                    </svg>
                }
                name="input"
                value="test"
                placeholder="example"
            />
        );
        screen.getByTitle('test icon');
    });

    test('can be cleared', () => {
        const onChange = jest.fn();
        render(<Input name="input" value="test" placeholder="example" onChange={onChange} />);
        const inputEle = screen.getByPlaceholderText('example');
        userEvent.hover(inputEle);
        const clearButton = screen.getByTitle('Close');
        userEvent.click(clearButton);
        expect(onChange).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: 'input', value: '' }));
    });

    test('clear button can be skipped', () => {
        const onChange = jest.fn();
        render(<Input clearable={false} name="input" value="test" placeholder="example" onChange={onChange} />);
        const inputEle = screen.getByPlaceholderText('example');
        userEvent.hover(inputEle);
        expect(screen.queryByTitle('Close')).toBeNull();
    });

    test('renders error when set', () => {
        const onChange = jest.fn();
        render(<Input error="Required" name="input" onChange={onChange} value="test" />);
        screen.getByText('Required');
    });
});
