/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useDelayCallback } from '.';

describe('useDelayCallback', () => {
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
            const [timedCb] = useDelayCallback(cb);
            return <div data-testid="test" onClick={timedCb} />;
        };

        render(<Component />);
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(1);
        expect(cb).toHaveBeenCalled();
    });

    test('runs the callback only after delay', () => {
        const cb = jest.fn();
        const Component = () => {
            const [timedCb] = useDelayCallback(cb, 500, []);
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
        const cb = jest.fn();
        const Component = () => {
            const [timedCb] = useDelayCallback(cb, 500, [], 'cancel');
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
        const cb = jest.fn();
        const Component = () => {
            const [timedCb] = useDelayCallback(cb, 500, [], 'prefer');
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

    test('returns a new callback by default', () => {
        const cb1 = jest.fn();
        const cb2 = jest.fn();
        const Component = ({ cb }: { cb: () => void }) => {
            const [timedCb] = useDelayCallback(cb, 500);
            return <div data-testid="test" onClick={timedCb} />;
        };

        const { rerender } = render(<Component cb={cb1} />);
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(500);
        expect(cb1).toHaveBeenCalled();
        rerender(<Component cb={cb2} />);
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(500);
        expect(cb2).toHaveBeenCalled();
    });

    test('memoizes the callback based on deps', () => {
        const cb1 = jest.fn();
        const cb2 = jest.fn();
        const Component = ({ cb }: { cb: () => void }) => {
            const [timedCb] = useDelayCallback(cb, 500, []);
            return <div data-testid="test" onClick={timedCb} />;
        };

        const { rerender } = render(<Component cb={cb1} />);
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(500);
        expect(cb1).toHaveBeenCalled();
        rerender(<Component cb={cb2} />);
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(500);
        expect(cb1).toHaveBeenCalledTimes(2);
        expect(cb2).not.toHaveBeenCalled();
    });

    test('only cleans up timers on unmount', () => {
        const cb = jest.fn();
        const Component = () => {
            const [timedCb] = useDelayCallback(cb);
            return <div data-testid="test" onClick={timedCb} />;
        };

        const { rerender, unmount } = render(<Component />);
        userEvent.click(screen.getByTestId('test'));
        jest.advanceTimersByTime(1);
        window.clearTimeout = jest.fn();
        rerender(<Component />);
        expect(cb).toHaveBeenCalled();
        expect(window.clearTimeout).not.toHaveBeenCalled();
        unmount();
        expect(window.clearTimeout).toHaveBeenCalled();
    });
});
