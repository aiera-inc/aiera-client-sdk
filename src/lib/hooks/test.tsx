/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';

import { useOutsideClickHandler, useWindowSize, useDelayCallback, useEventListener, useDrag } from '.';

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

describe('useWindowSize', () => {
    test('it updates the window size', () => {
        const { result } = renderHook(() => useWindowSize());
        expect(result.current.width).toBe(1024);
        expect(result.current.height).toBe(768);

        // @ts-ignore
        window.innerWidth = 100;
        // @ts-ignore
        window.innerHeight = 100;
        fireEvent(window, new Event('resize'));

        expect(result.current.width).toBe(100);
        expect(result.current.height).toBe(100);
    });
});

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

describe('useEventListener', () => {
    test('it fires listeners on window by default', () => {
        const listener = jest.fn();
        renderHook(() => useEventListener('resize', listener));
        fireEvent(window, new Event('resize'));
        expect(listener).toHaveBeenCalled();
    });

    test('it fires listeners on target element', () => {
        const listener = jest.fn();
        const ref = { current: document.createElement('div') };
        renderHook(() => useEventListener('resize', listener, ref));
        fireEvent(ref.current, new Event('resize'));
        expect(listener).toHaveBeenCalled();
    });
});

describe('useDrag', () => {
    test('it calculates drag positions', () => {
        const ref = { current: document.createElement('div') };
        const start = jest.fn();
        const end = jest.fn();
        const { result } = renderHook(() =>
            useDrag({
                dragTarget: ref,
                onDragStart: (_event, setPosition) => {
                    setPosition({ x: 10, y: 15 });
                    start();
                },
                onDragEnd: end,
            })
        );
        expect(result.current).toEqual([false, 0, 0]);

        fireEvent.mouseDown(ref.current);
        expect(result.current).toEqual([true, 10, 15]);

        const event = new Event('mousemove');
        // @ts-ignore
        event.movementX = 10;
        // @ts-ignore
        event.movementY = 15;
        fireEvent(document, event);
        expect(result.current).toEqual([true, 20, 30]);

        fireEvent.mouseUp(document);
        expect(result.current).toEqual([false, 0, 0]);
    });
});
