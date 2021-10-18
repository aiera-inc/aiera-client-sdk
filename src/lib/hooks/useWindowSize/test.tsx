/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useWindowSize } from '.';

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
