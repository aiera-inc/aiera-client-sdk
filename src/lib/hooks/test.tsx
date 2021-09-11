import React, { useCallback, useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useOutsideClickHandler, useTimedCallback } from '.';

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

describe('useTimedCallback', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('runs the callback', () => {
        const cb = jest.fn();
        const Component = () => {
            const [timedCb] = useTimedCallback(cb);
            return <div data-testid="test" onClick={timedCb} />;
        };

        render(<Component />);
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(1);
        expect(cb).toHaveBeenCalled();
    });

    test('runs the callback only after delay', () => {
        jest.useFakeTimers();
        const cb = jest.fn();
        const Component = () => {
            const [timedCb] = useTimedCallback(cb, [], 500);
            return <div data-testid="test" onClick={timedCb} />;
        };

        render(<Component />);
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(250);
        expect(cb).not.toHaveBeenCalled();
        jest.advanceTimersByTime(250);
        expect(cb).toHaveBeenCalled();
    });

    test('cancels existing timer on second call', () => {
        jest.useFakeTimers();
        const cb = jest.fn();
        const Component = () => {
            const [timedCb] = useTimedCallback(cb, [], 500, 'cancel');
            return <div data-testid="test" onClick={timedCb} />;
        };

        render(<Component />);
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(250);
        expect(cb).not.toHaveBeenCalled();
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(250);
        expect(cb).not.toHaveBeenCalled();
        jest.advanceTimersByTime(250);
        expect(cb).toHaveBeenCalled();
    });

    test('preserves existing timer on second call', () => {
        jest.useFakeTimers();
        const cb = jest.fn();
        const Component = () => {
            const [timedCb] = useTimedCallback(cb, [], 500, 'preserve');
            return <div data-testid="test" onClick={timedCb} />;
        };

        render(<Component />);
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(250);
        expect(cb).not.toHaveBeenCalled();
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(250);
        expect(cb).toHaveBeenCalled();
    });
});
