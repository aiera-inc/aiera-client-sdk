/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

import { useDrag } from '.';

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
