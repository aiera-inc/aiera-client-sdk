import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { FormFieldInput } from '.';

describe('FormFieldInput', () => {
    test('renders', () => {
        renderWithProvider(<FormFieldInput name="default test" placeholder="example" value="test" />);
        const inputEle = screen.getByPlaceholderText('example');
        expect(inputEle).toHaveValue('test');
    });

    test('renders description only when supplied', () => {
        const { rendered, rerender } = renderWithProvider(
            <FormFieldInput description="example" name="default test" value="test" />
        );
        const description = rendered.container.querySelector('.form-field__description');
        expect(description).toBeTruthy();
        rerender(<FormFieldInput name="default test" value="test" />);
        expect(rendered.container.querySelector('.form-field__description')).toBeNull();
    });

    test('renders label only when supplied', () => {
        const { rendered, rerender } = renderWithProvider(
            <FormFieldInput label="example" name="default test" value="test" />
        );
        const label = rendered.container.querySelector('.form-field__label');
        expect(label).toBeTruthy();
        rerender(<FormFieldInput name="default test" value="test" />);
        expect(rendered.container.querySelector('.form-field__label')).toBeNull();
    });

    test('calls onChange when input value changes', () => {
        const onChange = jest.fn();
        renderWithProvider(
            <FormFieldInput name="default test" onChange={onChange} placeholder="example" value="test" />
        );
        const inputEle = screen.getByPlaceholderText('example');
        fireEvent.change(inputEle, { target: { value: 'changed' } });
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { name: 'default test', value: 'changed' });
    });
});
