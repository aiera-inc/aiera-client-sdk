/* eslint-disable @typescript-eslint/ban-ts-comment */
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useTimeAgo } from '.';

describe('useTimeAgo', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllTimers();
    });

    test('it formats a date', () => {
        // Past date
        const date = new Date();
        const { result } = renderHook(() => useTimeAgo(date));
        expect(result.current).toBe('just now');
        // Future date
        const futureDate = new Date(date.getTime() + 125000); // 2.5 minutes from now
        const { result: resultFuture } = renderHook(() => useTimeAgo(futureDate));
        expect(resultFuture.current).toBe('in 2 minutes');
    });

    test('when realtime is true, it automatically updates the date', () => {
        const date = new Date(new Date().getTime() - 50000); // 50 seconds ago
        const { result } = renderHook(() => useTimeAgo(date, true));
        expect(result.current).toBe('50 seconds ago');
        act(() => {
            jest.runOnlyPendingTimers(); // fast-forward timeout in the hook
        });
        expect(result.current).toBe('30 minutes ago');
    });
});
