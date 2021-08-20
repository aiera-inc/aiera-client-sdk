import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { Tabs } from '.';

describe('Tabs', () => {
    test('renders', () => {
        const onChange = jest.fn();
        render(
            <Tabs
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
});
