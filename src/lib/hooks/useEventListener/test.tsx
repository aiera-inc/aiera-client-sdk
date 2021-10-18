/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useEventListener } from '.';

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
