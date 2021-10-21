/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/unbound-method */
import { fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useAutoScroll } from '.';

describe('useAutoScroll', () => {
    test('calls scrollIntoView on the target ref when it changes', () => {
        const { result, rerender } = renderHook(() => useAutoScroll());
        const [scrollRef, targetRef] = result.current;
        // @ts-ignore
        scrollRef.current = document.createElement('div');
        // @ts-ignore
        targetRef.current = document.createElement('div');
        targetRef.current.scrollIntoView = jest.fn();

        // target ref was null so scroll shouldn't have been called
        expect(targetRef.current.scrollIntoView).not.toHaveBeenCalled();

        // target ref is now set so scroll should have been called
        rerender();
        expect(targetRef.current.scrollIntoView).toHaveBeenCalledTimes(1);

        // target ref didn't change so scroll should not have been called again
        rerender();
        expect(targetRef.current.scrollIntoView).toHaveBeenCalledTimes(1);

        // @ts-ignore
        targetRef.current = document.createElement('div');
        targetRef.current.scrollIntoView = jest.fn();
        rerender();
        // target ref changed so scroll should have been called again
        expect(targetRef.current.scrollIntoView).toHaveBeenCalledTimes(1);
    });

    test('pauses auto scrolling after manual scroll', () => {
        const { result, rerender } = renderHook(() => useAutoScroll());
        const [scrollRef, targetRef] = result.current;
        // @ts-ignore
        scrollRef.current = document.createElement('div');
        // @ts-ignore
        targetRef.current = document.createElement('div');
        targetRef.current.scrollIntoView = jest.fn();
        // Rerender with the refs set so we get to an initial autoscrolled state
        rerender();
        expect(targetRef.current.scrollIntoView).toHaveBeenCalled();

        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetRef.current.getBoundingClientRect = jest.fn(() => ({ top: 50, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollRef.current.getBoundingClientRect = jest.fn(() => ({
            top: 100,
        }));
        fireEvent.scroll(scrollRef.current);
        expect(targetRef.current.getBoundingClientRect).toHaveBeenCalled();
        expect(scrollRef.current.getBoundingClientRect).toHaveBeenCalled();

        // @ts-ignore
        targetRef.current = document.createElement('div');
        targetRef.current.scrollIntoView = jest.fn();
        rerender();
        expect(targetRef.current.scrollIntoView).not.toHaveBeenCalled();

        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetRef.current.getBoundingClientRect = jest.fn(() => ({ top: 100, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollRef.current.getBoundingClientRect = jest.fn(() => ({
            top: 100,
        }));
        fireEvent.scroll(scrollRef.current);

        // @ts-ignore
        targetRef.current = document.createElement('div');
        targetRef.current.scrollIntoView = jest.fn();
        rerender();
        expect(targetRef.current.scrollIntoView).toHaveBeenCalled();

        // Now check using bottom

        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetRef.current.getBoundingClientRect = jest.fn(() => ({ bottom: 100, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollRef.current.getBoundingClientRect = jest.fn(() => ({
            bottom: 50,
        }));
        fireEvent.scroll(scrollRef.current);
        expect(targetRef.current.getBoundingClientRect).toHaveBeenCalled();
        expect(scrollRef.current.getBoundingClientRect).toHaveBeenCalled();

        // @ts-ignore
        targetRef.current = document.createElement('div');
        targetRef.current.scrollIntoView = jest.fn();
        rerender();
        expect(targetRef.current.scrollIntoView).not.toHaveBeenCalled();

        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        targetRef.current.getBoundingClientRect = jest.fn(() => ({ bottom: 100, height: 30 }));
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        scrollRef.current.getBoundingClientRect = jest.fn(() => ({
            bottom: 100,
        }));
        fireEvent.scroll(scrollRef.current);

        // @ts-ignore
        targetRef.current = document.createElement('div');
        targetRef.current.scrollIntoView = jest.fn();
        rerender();
        expect(targetRef.current.scrollIntoView).toHaveBeenCalled();
    });
});
