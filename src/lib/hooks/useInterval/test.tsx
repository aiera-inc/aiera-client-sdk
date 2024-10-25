import { renderHook } from '@testing-library/react';
import { useInterval } from '.';

type Callback = () => void | Promise<void>;

interface UseIntervalProps {
    delay: number | null;
    callback: Callback;
}

describe('useInterval', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllTimers();
    });

    test('fires the callback on and interval', () => {
        const listener = jest.fn();
        const hook = renderHook(
            (props: UseIntervalProps) => {
                useInterval(props.callback, props.delay);
            },
            {
                initialProps: { delay: 500, callback: listener },
            }
        );

        jest.advanceTimersByTime(200);
        expect(listener).not.toHaveBeenCalled();
        jest.advanceTimersByTime(301);
        expect(listener).toHaveBeenCalled();

        listener.mockReset();
        jest.advanceTimersByTime(200);
        expect(listener).not.toHaveBeenCalled();
        jest.advanceTimersByTime(301);
        expect(listener).toHaveBeenCalled();

        listener.mockReset();
        hook.rerender({ delay: null, callback: listener });
        jest.advanceTimersByTime(501);
        expect(listener).not.toHaveBeenCalled();
    });
});
