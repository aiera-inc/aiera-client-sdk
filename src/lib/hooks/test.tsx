import React, { useCallback, useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useOutsideClickHandler } from '.';

describe('useOutsideClickHandler', () => {
    test('fires the outside click handler only when clicking outside the target refs', () => {
        const outsideHandler = jest.fn();
        const TestComponent = () => {
            const ref1 = useRef<HTMLDivElement>(null);
            const ref2 = useRef<HTMLDivElement>(null);
            useOutsideClickHandler(
                [ref1, ref2],
                useCallback((event) => {
                    outsideHandler(event);
                }, [])
            );

            return (
                <div>
                    outside
                    <div ref={ref1}>inside</div>
                    <div ref={ref2}>other</div>
                </div>
            );
        };
        render(<TestComponent />);
        userEvent.click(screen.getByText('inside'));
        expect(outsideHandler).not.toHaveBeenCalled();
        userEvent.click(screen.getByText('other'));
        expect(outsideHandler).not.toHaveBeenCalled();
        userEvent.click(screen.getByText('outside'));
        expect(outsideHandler).toHaveBeenCalled();
    });
});
