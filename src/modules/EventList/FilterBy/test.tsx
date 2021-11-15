import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChangeHandler } from '@aiera/client-sdk/types';
import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { FilterBy } from '.';

function TestComponent() {
    const [value, setValue] = useState([1]);
    const onChange: ChangeHandler<number[]> = (_e, { value }) => {
        if (Array.isArray(value)) {
            setValue(value);
        }
    };
    return (
        <FilterBy<number>
            onChange={onChange}
            options={[
                { value: 1, label: 'One' },
                { value: 2, label: 'Two' },
            ]}
            value={value}
        />
    );
}

describe('FilterBy', () => {
    test('renders', () => {
        const onChange = jest.fn();
        render(
            <FilterBy<number>
                onChange={onChange}
                options={[
                    { value: 1, label: 'One' },
                    { value: 2, label: 'Two' },
                ]}
                value={[1]}
            />
        );
        fireEvent.click(screen.getByText('One'));
        expect(onChange).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ value: [] }));
        fireEvent.click(screen.getByText('Two'));
        expect(onChange).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ value: [1, 2] }));
        expect(screen.getByText('One').classList).toContain('eventlist__filterby__option--selected');
    });

    test('renders children', () => {
        const onChange = jest.fn();
        render(
            <FilterBy<number>
                onChange={onChange}
                options={[
                    { value: 1, label: 'One' },
                    { value: 2, label: 'Two' },
                ]}
                value={[1]}
            >
                children
            </FilterBy>
        );

        screen.getByText('children');
    });

    test('navigate by keyboard', () => {
        renderWithProvider(<TestComponent />);
        userEvent.tab();
        userEvent.tab();
        const optionOne = screen.getByText('One');
        const optionTwo = screen.getByText('Two');
        expect(optionOne).not.toHaveFocus();
        expect(optionTwo).toHaveFocus();
        fireEvent.keyDown(document, { key: 'Enter' });
        expect(optionTwo).toHaveClass('eventlist__filterby__option--selected');
    });
});
