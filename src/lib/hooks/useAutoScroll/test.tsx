/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/unbound-method */
import { RefCallback } from 'react';
import { act, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useAutoScroll } from '.';

describe('useAutoScroll', () => {
    function refDiv(ref?: RefCallback<HTMLDivElement>, div?: HTMLDivElement) {
        if (!div) {
            div = document.createElement('div');
            div.scrollIntoView = jest.fn();
        }
        act(() => ref?.(div || null));
        return div;
    }

    test('calls scrollIntoView on the target ref when it changes', () => {
        const { result, rerender } = renderHook(() => useAutoScroll());
        const [scrollRef, targetRef] = result.current;
        refDiv(scrollRef);
        let targetDiv = refDiv();

        // target ref was null so scroll shouldn't have been called
        expect(targetDiv.scrollIntoView).not.toHaveBeenCalled();

        refDiv(targetRef, targetDiv);
        // target ref is now set so scroll should have been called
        expect(targetDiv.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));

        // target ref didn't change so scroll should not have been called again
        rerender();
        expect(targetDiv.scrollIntoView).toHaveBeenCalledTimes(1);

        targetDiv = refDiv(targetRef);
        // target ref changed so scroll should have been called again
        expect(targetDiv.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    });

    test('pauses auto scrolling after manual scroll', () => {
        const { result, rerender } = renderHook(() => useAutoScroll());
        const [scrollRef, targetRef] = result.current;
        const scrollDiv = refDiv(scrollRef);
        let targetDiv = refDiv();

        // target ref was null so scroll shouldn't have been called
        expect(targetDiv.scrollIntoView).not.toHaveBeenCalled();

        // Rerender with the refs set so we get to an initial autoscrolled state
        refDiv(targetRef, targetDiv);
        expect(targetDiv.scrollIntoView).toHaveBeenCalled();

        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetDiv.getBoundingClientRect = jest.fn(() => ({ top: 50, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollDiv.getBoundingClientRect = jest.fn(() => ({
            top: 100,
        }));
        fireEvent.scroll(scrollDiv);
        expect(targetDiv.getBoundingClientRect).toHaveBeenCalled();
        expect(scrollDiv.getBoundingClientRect).toHaveBeenCalled();

        targetDiv = refDiv(targetRef);
        expect(targetDiv.scrollIntoView).not.toHaveBeenCalled();

        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetDiv.getBoundingClientRect = jest.fn(() => ({ top: 100, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollDiv.getBoundingClientRect = jest.fn(() => ({
            top: 100,
        }));
        fireEvent.scroll(scrollDiv);

        targetDiv = refDiv(targetRef);
        expect(targetDiv.scrollIntoView).toHaveBeenCalled();

        // Now check using bottom

        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetDiv.getBoundingClientRect = jest.fn(() => ({ bottom: 100, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollDiv.getBoundingClientRect = jest.fn(() => ({
            bottom: 50,
        }));
        fireEvent.scroll(scrollDiv);
        expect(targetDiv.getBoundingClientRect).toHaveBeenCalled();
        expect(scrollDiv.getBoundingClientRect).toHaveBeenCalled();

        targetDiv = refDiv(targetRef);
        expect(targetDiv.scrollIntoView).not.toHaveBeenCalled();

        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetDiv.getBoundingClientRect = jest.fn(() => ({ bottom: 100, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollDiv.getBoundingClientRect = jest.fn(() => ({
            bottom: 100,
        }));
        fireEvent.scroll(scrollDiv);

        targetDiv = refDiv(targetRef);
        rerender();
        expect(targetDiv.scrollIntoView).toHaveBeenCalled();
    });
});
