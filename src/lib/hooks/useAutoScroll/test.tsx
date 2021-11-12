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

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    async function finishScrolling(result: ReturnType<typeof useAutoScroll>) {
        jest.advanceTimersByTime(200);
        await result[2].current;
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

    test('pauses auto scrolling after manual scroll', async () => {
        const { result } = renderHook(() => useAutoScroll({ log: true }));
        const [scrollRef, targetRef] = result.current;
        const scrollDiv = refDiv(scrollRef);
        let targetDiv = refDiv();

        // target ref was null so scroll shouldn't have been called
        expect(targetDiv.scrollIntoView).not.toHaveBeenCalled();

        // Rerender with the refs set so we get to an initial autoscrolled state
        refDiv(targetRef, targetDiv);
        expect(targetDiv.scrollIntoView).toHaveBeenCalled();
        await finishScrolling(result.current);

        // Set the target outside of the scroll container, meaning the user scrolled away
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetDiv.getBoundingClientRect = jest.fn(() => ({ top: 50, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollDiv.getBoundingClientRect = jest.fn(() => ({
            top: 100,
        }));
        fireEvent.scroll(scrollDiv);
        expect(targetDiv.getBoundingClientRect).toHaveBeenCalled();
        expect(scrollDiv.getBoundingClientRect).toHaveBeenCalled();

        // Confirm that the target ref wasn't scrolled into view
        targetDiv = refDiv(targetRef);
        expect(targetDiv.scrollIntoView).not.toHaveBeenCalled();

        // Set the target inside of the scroll container, meaning the user scrolled back to the current target
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetDiv.getBoundingClientRect = jest.fn(() => ({ top: 100, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollDiv.getBoundingClientRect = jest.fn(() => ({
            top: 100,
        }));
        fireEvent.scroll(scrollDiv);

        // Confirm that the target ref was scrolled into view
        targetDiv = refDiv(targetRef);
        expect(targetDiv.scrollIntoView).toHaveBeenCalled();
        await finishScrolling(result.current);

        // Now check using bottom

        // Set the target outside of the scroll container, meaning the user scrolled away
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetDiv.getBoundingClientRect = jest.fn(() => ({ bottom: 100, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollDiv.getBoundingClientRect = jest.fn(() => ({
            bottom: 50,
        }));
        fireEvent.scroll(scrollDiv);
        expect(targetDiv.getBoundingClientRect).toHaveBeenCalled();
        expect(scrollDiv.getBoundingClientRect).toHaveBeenCalled();

        // Confirm that the target ref wasn't scrolled into view
        targetDiv = refDiv(targetRef);
        expect(targetDiv.scrollIntoView).not.toHaveBeenCalled();

        // Set the target inside of the scroll container, meaning the user scrolled back to the current target
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetDiv.getBoundingClientRect = jest.fn(() => ({ bottom: 100, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollDiv.getBoundingClientRect = jest.fn(() => ({
            bottom: 100,
        }));
        fireEvent.scroll(scrollDiv);

        // Confirm that the target ref was scrolled into view
        targetDiv = refDiv(targetRef);
        expect(targetDiv.scrollIntoView).toHaveBeenCalled();
        await finishScrolling(result.current);
    });

    test('does not pause auto scrolling after manual scroll when pauseOnUserScroll is false', () => {
        const { result } = renderHook(() => useAutoScroll({ pauseOnUserScroll: false }));
        const [scrollRef, targetRef] = result.current;
        const scrollDiv = refDiv(scrollRef);
        let targetDiv = refDiv();

        // target ref was null so scroll shouldn't have been called
        expect(targetDiv.scrollIntoView).not.toHaveBeenCalled();

        // Rerender with the refs set so we get to an initial autoscrolled state
        refDiv(targetRef, targetDiv);
        expect(targetDiv.scrollIntoView).toHaveBeenCalled();

        // Set the target inside of the scroll container, meaning the user scrolled back to the current target
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetDiv.getBoundingClientRect = jest.fn(() => ({ top: 50, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollDiv.getBoundingClientRect = jest.fn(() => ({
            top: 100,
        }));
        fireEvent.scroll(scrollDiv);
        expect(targetDiv.getBoundingClientRect).not.toHaveBeenCalled();
        expect(scrollDiv.getBoundingClientRect).not.toHaveBeenCalled();

        // Confirm that the target ref was scrolled into view
        targetDiv = refDiv(targetRef);
        expect(targetDiv.scrollIntoView).toHaveBeenCalled();
    });

    test('skips calling scrollIntoView if skip is set', () => {
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

    test('calls scrollIntoView with the correct options', () => {
        const { result, rerender } = renderHook(() =>
            useAutoScroll({ initialBehavior: 'smooth', behavior: 'auto', block: 'start', inline: 'start' })
        );
        const [scrollRef, targetRef] = result.current;
        refDiv(scrollRef);
        let targetDiv = refDiv();

        // target ref was null so scroll shouldn't have been called
        expect(targetDiv.scrollIntoView).not.toHaveBeenCalled();

        refDiv(targetRef, targetDiv);
        // target ref is now set so scroll should have been called
        expect(targetDiv.scrollIntoView).toHaveBeenCalledWith(
            expect.objectContaining({ behavior: 'smooth', block: 'start', inline: 'start' })
        );

        // target ref didn't change so scroll should not have been called again
        rerender();
        expect(targetDiv.scrollIntoView).toHaveBeenCalledTimes(1);

        targetDiv = refDiv(targetRef);
        // target ref changed so scroll should have been called again
        expect(targetDiv.scrollIntoView).toHaveBeenCalledWith(
            expect.objectContaining({ behavior: 'auto', block: 'start', inline: 'start' })
        );
    });

    test('does not pause autoscrolling while autoscrolling', async () => {
        const { result } = renderHook(() => useAutoScroll());
        const [scrollRef, targetRef] = result.current;
        const scrollDiv = refDiv(scrollRef);
        const targetDiv = refDiv();

        // target ref was null so scroll shouldn't have been called
        expect(targetDiv.scrollIntoView).not.toHaveBeenCalled();

        // Rerender with the refs set so we get to an initial autoscrolled state
        refDiv(targetRef, targetDiv);
        expect(targetDiv.scrollIntoView).toHaveBeenCalled();

        // Set the target outside of the scroll container, meaning the user scrolled away
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetDiv.getBoundingClientRect = jest.fn(() => ({ top: 50, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollDiv.getBoundingClientRect = jest.fn(() => ({
            top: 100,
        }));
        fireEvent.scroll(scrollDiv);
        expect(targetDiv.getBoundingClientRect).not.toHaveBeenCalled();
        expect(scrollDiv.getBoundingClientRect).not.toHaveBeenCalled();

        await finishScrolling(result.current);
        fireEvent.scroll(scrollDiv);
        expect(targetDiv.getBoundingClientRect).toHaveBeenCalled();
        expect(scrollDiv.getBoundingClientRect).toHaveBeenCalled();
    });
});
