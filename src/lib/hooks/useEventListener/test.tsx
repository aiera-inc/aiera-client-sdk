/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useElementListener, useWindowListener, useDocumentListener } from '.';

describe('useEventListener', () => {
    test('it fires listeners on window', () => {
        const listener = jest.fn();
        renderHook(() => useWindowListener('resize', listener));
        fireEvent(window, new Event('resize'));
        expect(listener).toHaveBeenCalled();
    });

    test('it fires listeners on document', () => {
        const listener = jest.fn();
        renderHook(() => useDocumentListener('resize', listener));
        fireEvent(document, new Event('resize'));
        expect(listener).toHaveBeenCalled();
    });

    test('it fires listeners on target element', () => {
        const listener = jest.fn();
        const ref = { current: document.createElement('div') };
        renderHook(() => useElementListener('resize', listener, ref));
        fireEvent(ref.current, new Event('resize'));
        expect(listener).toHaveBeenCalled();
    });
});
