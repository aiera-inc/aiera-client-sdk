/* eslint-disable @typescript-eslint/ban-ts-comment */
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

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

    describe('when realtime is true, it automatically updates the date', () => {
        test('when the date is more than 24 hours ago, it should not update the time ago', () => {
            const date = new Date(new Date().getTime() - 90000000); // 25 hours ago
            const { result } = renderHook(() => useTimeAgo(date, true));
            expect(result.current).toBe('1 day ago');
            act(() => {
                jest.runOnlyPendingTimers(); // default realtime update is every hour
            });
            expect(result.current).toBe('1 day ago'); // shouldn't change
        });

        test('when the date is within 24 hours, it should update every 30 minutes', () => {
            const date = new Date(new Date().getTime() - 5400000); // 1.5 hours ago
            const { result } = renderHook(() => useTimeAgo(date, true));
            expect(result.current).toBe('1 hour ago');
            act(() => {
                jest.advanceTimersByTime(1800000); // fast-forward 30 minutes
            });
            expect(result.current).toBe('2 hours ago'); // should be an hour later
        });

        test('when the date is within 30 minutes, it should update every minute', () => {
            const date = new Date(new Date().getTime() - 1500000); // 25 minutes ago
            const { result } = renderHook(() => useTimeAgo(date, true));
            expect(result.current).toBe('25 minutes ago');
            act(() => {
                jest.advanceTimersByTime(60000); // fast-forward 1 minute
            });
            expect(result.current).toBe('26 minutes ago'); // should be a minute later
        });

        test('when the date is within a minute, it should update every second', () => {
            const date = new Date(new Date().getTime() - 30000); // 0.5 seconds ago
            const { result } = renderHook(() => useTimeAgo(date, true));
            expect(result.current).toBe('30 seconds ago');
            act(() => {
                jest.advanceTimersByTime(1000); // fast-forward 1 second
            });
            expect(result.current).toBe('31 seconds ago'); // should be a second later
        });
    });
});
