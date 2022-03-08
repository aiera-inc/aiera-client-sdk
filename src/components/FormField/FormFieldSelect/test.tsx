import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { FormFieldSelect } from '.';

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
