import { renderHook } from '@testing-library/react-hooks';

import { useInterval } from '.';

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
        const hook = renderHook<{ delay: number | null; callback: () => void }, void>(
            ({ delay, callback }) => {
                useInterval(callback, delay);
            },
            { initialProps: { delay: 500, callback: listener } }
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
