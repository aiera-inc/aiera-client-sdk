import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { FormField, FormFieldInput, FormFieldSelect } from '.';

describe('FormField', () => {
    test('renders', () => {
        const { rendered } = renderWithProvider(<FormField />);
        expect(rendered.container.querySelector('.form-field')).toBeInTheDocument();
    });
});

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

describe('FormFieldSelect', () => {
    const mockOptions = [
        {
            label: 'test 1',
            description: 'test option 1',
            value: '1',
        },
        {
            label: 'test 2',
            description: 'test option 2',
            value: '2',
        },
    ];

    test('renders select options', () => {
        renderWithProvider(<FormFieldSelect name="select test" options={mockOptions} value="test" />);
        screen.getByText('test option 1');
        screen.getByText('test option 2');
    });

    test('calls onChange when an option is clicked', () => {
        const onChange = jest.fn();
        renderWithProvider(<FormFieldSelect name="select test" onChange={onChange} options={mockOptions} value="1" />);
        const optionEl = screen.getByText('test option 2');
        fireEvent.click(optionEl);
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { name: 'select test', value: '2' });
    });

    test('renders checkmark for selected option', () => {
        const { rerender } = renderWithProvider(<FormFieldSelect name="select test" options={mockOptions} value="1" />);
        const selectedEl = screen.getByText('test option 1').closest('div')?.parentNode;
        const otherEl = screen.getByText('test option 2').closest('div')?.parentNode;
        expect(selectedEl?.querySelector('svg')).toBeTruthy();
        expect(otherEl?.querySelector('svg')).toBeFalsy();
        rerender(<FormFieldSelect name="select test" options={mockOptions} value="2" />);
        expect(selectedEl?.querySelector('svg')).toBeFalsy();
        expect(otherEl?.querySelector('svg')).toBeTruthy();
    });
});
