import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { FormField } from '.';

describe('FormField', () => {
    describe('handles input type', () => {
        test('renders input form field by default', () => {
            renderWithProvider(<FormField name="default test" placeholder="example" value="test" />);
            const inputEle = screen.getByPlaceholderText('example');
            expect(inputEle).toHaveValue('test');
        });

        test('renders description only when supplied', () => {
            const { rendered, rerender } = renderWithProvider(
                <FormField description="example" name="default test" value="test" />
            );
            const description = rendered.container.querySelector('.form-field__description');
            expect(description).toBeTruthy();
            rerender(<FormField name="default test" value="test" />);
            expect(rendered.container.querySelector('.form-field__description')).toBeNull();
        });

        test('renders label only when supplied', () => {
            const { rendered, rerender } = renderWithProvider(
                <FormField label="example" name="default test" value="test" />
            );
            const label = rendered.container.querySelector('.form-field__label');
            expect(label).toBeTruthy();
            rerender(<FormField name="default test" value="test" />);
            expect(rendered.container.querySelector('.form-field__label')).toBeNull();
        });

        test('calls onChange when input value changes', () => {
            const onChange = jest.fn();
            renderWithProvider(
                <FormField name="default test" onChange={onChange} placeholder="example" value="test" />
            );
            const inputEle = screen.getByPlaceholderText('example');
            fireEvent.change(inputEle, { target: { value: 'changed' } });
            expect(onChange).toHaveBeenCalledWith(expect.anything(), { name: 'default test', value: 'changed' });
        });
    });

    describe('handles select type', () => {
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

        test('renders select form field options when type is select and options are supplied', () => {
            const { rerender } = renderWithProvider(
                <FormField name="select test" options={mockOptions} type="select" value="test" />
            );
            screen.getByText('test option 1');
            screen.getByText('test option 2');
            rerender(<FormField name="default test" type="select" value="test" />);
            expect(screen.queryByText('test option 1')).toBeNull();
        });

        test('calls onChange when an option is clicked', () => {
            const onChange = jest.fn();
            renderWithProvider(
                <FormField name="select test" onChange={onChange} options={mockOptions} type="select" value="1" />
            );
            const optionEl = screen.getByText('test option 2');
            fireEvent.click(optionEl);
            expect(onChange).toHaveBeenCalledWith(expect.anything(), { name: 'select test', value: '2' });
        });

        test('renders checkmark for selected option', () => {
            const { rerender } = renderWithProvider(
                <FormField name="select test" options={mockOptions} type="select" value="1" />
            );
            const selectedEl = screen.getByText('test option 1').closest('div')?.parentNode;
            const otherEl = screen.getByText('test option 2').closest('div')?.parentNode;
            expect(selectedEl?.querySelector('svg')).toBeTruthy();
            expect(otherEl?.querySelector('svg')).toBeFalsy();
            rerender(<FormField name="select test" options={mockOptions} type="select" value="2" />);
            expect(selectedEl?.querySelector('svg')).toBeFalsy();
            expect(otherEl?.querySelector('svg')).toBeTruthy();
        });
    });
});
