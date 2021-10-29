/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useElementSize } from '.';

describe('useElementSize', () => {
    test('it updates the window size', () => {
        const { result } = renderHook(() => useElementSize());
        const { ref } = result.current;
        // @ts-ignore
        ref.current = { clientHeight: 0, clientWidth: 0 };
        expect(result.current.width).toBe(0);
        expect(result.current.height).toBe(0);

        // @ts-ignore
        ref.current = { clientHeight: 100, clientWidth: 100 };

        // @ts-ignore
        window.innerWidth = 100;
        // @ts-ignore
        window.innerHeight = 100;
        fireEvent(window, new Event('resize'));

        expect(result.current.width).toBe(100);
        expect(result.current.height).toBe(100);
    });
});
