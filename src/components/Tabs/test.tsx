import React from 'react';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import userEvent from '@testing-library/user-event';

import { Tabs } from '.';

describe('Tabs', () => {
    test('renders', () => {
        const onChange = jest.fn();
        render(
            <Tabs<number>
                onChange={onChange}
                options={[
                    { value: 1, label: 'One' },
                    { value: 2, label: 'Two' },
                ]}
                value={1}
            />
        );
        fireEvent.click(screen.getByText('One'));
        expect(onChange).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ value: 1 }));
        fireEvent.click(screen.getByText('Two'));
        expect(onChange).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ value: 2 }));
        expect(screen.getByText('One').classList).toContain('tab__option--selected');
    });

    test('navigate by keyboard', () => {
        let val = 1;
        const onChange: ChangeHandler<number> = (_e, { value }) => {
            if (typeof value === 'number') {
                val = value;
            }
        };
        const { rerender } = renderWithProvider(
            <Tabs<number>
                onChange={onChange}
                options={[
                    { value: 1, label: 'One' },
                    { value: 2, label: 'Two' },
                ]}
                value={val}
            />
        );
        const firstTab = screen.getByText('One');
        const secondTab = screen.getByText('Two');
        expect(firstTab).toHaveClass('tab__option--selected');
        expect(secondTab).not.toHaveClass('tab__option--selected');
        userEvent.tab();
        expect(firstTab).toHaveFocus();
        userEvent.tab();
        expect(secondTab).toHaveFocus();
        fireEvent.keyDown(document, { key: 'Enter' });
        rerender(
            <Tabs<number>
                onChange={onChange}
                options={[
                    { value: 1, label: 'One' },
                    { value: 2, label: 'Two' },
                ]}
                value={val}
            />
        );
        expect(firstTab).not.toHaveClass('tab__option--selected');
        expect(secondTab).toHaveClass('tab__option--selected');
    });
});
