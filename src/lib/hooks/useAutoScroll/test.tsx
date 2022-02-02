/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/unbound-method */
import { RefCallback } from 'react';
import { act, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useAutoScroll } from '.';

describe('useAutoScroll', () => {
    const scrollRect = {
        top: 100,
        height: 500,
        bottom: 600,
        left: 0,
        right: 100,
        y: 100,
        x: 0,
        width: 100,
    } as DOMRect;

    const outsideRect = {
        top: 0,
        height: 50,
        bottom: 50,
        left: 0,
        right: 100,
        y: 0,
        x: 0,
        width: 100,
    } as DOMRect;

    const insideRect = {
        top: 105,
        height: 50,
        bottom: 155,
        left: 0,
        right: 100,
        y: 0,
        x: 0,
        width: 100,
    } as DOMRect;

    function createDiv() {
        const div = document.createElement('div');
        div.scrollIntoView = jest.fn();
        div.scrollTo = jest.fn();
        return div;
    }

    function setScrollContainer(scrollDiv: HTMLDivElement) {
        scrollDiv.getBoundingClientRect = jest.fn(() => scrollRect);
    }

    function createScrollContainer() {
        const div = createDiv();
        setScrollContainer(div);
        return div;
    }

    function setInsideContainer(div: HTMLDivElement) {
        div.getBoundingClientRect = jest.fn(() => insideRect);
    }

    function setOutsideContainer(div: HTMLDivElement) {
        div.getBoundingClientRect = jest.fn(() => outsideRect);
    }

    function updateRef(ref: RefCallback<HTMLDivElement>, div: HTMLDivElement) {
        act(() => ref(div));
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
        await result.isAutoScrolling.current;
    }

    test('calls scrollTo on the target ref when it changes and it is out of viewport', () => {
        const { result, rerender } = renderHook(() => useAutoScroll());
        const { scrollContainerRef, targetRef } = result.current;
        const scrollDiv = createScrollContainer();
        updateRef(scrollContainerRef, scrollDiv);
        let targetDiv = createDiv();

        // target ref was null so scroll shouldn't have been called
        expect(targetDiv.scrollTo).not.toHaveBeenCalled();

        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        // target ref is now set so scroll should have been called
        expect(scrollDiv.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));

        // target ref didn't change so scroll should not have been called again
        rerender();
        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(1);

        targetDiv = createDiv();
        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        // target ref changed so scroll should have been called again
        expect(scrollDiv.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'smooth' }));

        targetDiv = createDiv();
        setInsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        // target ref changed but is still inside the container so scroll should not have been called again
        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(2);
    });

    test('pauses auto scrolling after manual scroll', async () => {
        const { result } = renderHook(() => useAutoScroll());
        const { scrollContainerRef, targetRef } = result.current;
        const scrollDiv = createScrollContainer();
        updateRef(scrollContainerRef, scrollDiv);
        let targetDiv = createDiv();

        // target ref was null so scroll shouldn't have been called
        expect(scrollDiv.scrollTo).not.toHaveBeenCalled();

        // Rerender with the refs set so we get to an initial autoscrolled state
        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        expect(scrollDiv.scrollTo).toHaveBeenCalled();
        await finishScrolling(result.current);

        // Set the target outside of the scroll container, meaning the user scrolled away
        setOutsideContainer(targetDiv);
        fireEvent.scroll(scrollDiv);
        expect(targetDiv.getBoundingClientRect).toHaveBeenCalled();
        expect(scrollDiv.getBoundingClientRect).toHaveBeenCalled();

        // Confirm that the target ref wasn't scrolled into view
        targetDiv = createDiv();
        updateRef(targetRef, targetDiv);
        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(1);

        // Set the target inside of the scroll container, meaning the user scrolled back to the current target
        setInsideContainer(targetDiv);
        fireEvent.scroll(scrollDiv);

        // Confirm that the target ref was scrolled into view
        targetDiv = createDiv();
        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(2);
        await finishScrolling(result.current);
    });

    test('does not pause auto scrolling after manual scroll when pauseOnUserScroll is false', async () => {
        const { result } = renderHook(() => useAutoScroll({ pauseOnUserScroll: false }));
        const { scrollContainerRef, targetRef } = result.current;
        const scrollDiv = createScrollContainer();
        updateRef(scrollContainerRef, scrollDiv);
        let targetDiv = createDiv();

        // target ref was null so scroll shouldn't have been called
        expect(scrollDiv.scrollTo).not.toHaveBeenCalled();

        // Rerender with the refs set so we get to an initial autoscrolled state
        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        expect(scrollDiv.scrollTo).toHaveBeenCalled();
        await finishScrolling(result.current);

        // Set the target outside of the scroll container, meaning the user scrolled away
        setOutsideContainer(targetDiv);
        fireEvent.scroll(scrollDiv);

        // Confirm that the target ref was scrolled into view
        targetDiv = createDiv();
        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(2);
        await finishScrolling(result.current);
    });

    test('skips calling scrollTo if skip is set', () => {
        const { result } = renderHook(() => useAutoScroll({ skip: true }));
        const { scrollContainerRef, targetRef } = result.current;
        const scrollDiv = createScrollContainer();
        updateRef(scrollContainerRef, scrollDiv);
        const targetDiv = createDiv();

        // target ref was null so scroll shouldn't have been called
        expect(scrollDiv.scrollTo).not.toHaveBeenCalled();

        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        // target ref is now set so scroll should have been called
        expect(scrollDiv.scrollTo).not.toHaveBeenCalled();
    });

    test('calls scrollTo with the correct options', () => {
        const { result, rerender } = renderHook(() => useAutoScroll({ initialBehavior: 'smooth', behavior: 'auto' }));
        const { scrollContainerRef, targetRef } = result.current;
        const scrollDiv = createScrollContainer();
        updateRef(scrollContainerRef, scrollDiv);
        let targetDiv = createDiv();

        // target ref was null so scroll shouldn't have been called
        expect(scrollDiv.scrollTo).not.toHaveBeenCalled();

        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        // target ref is now set so scroll should have been called
        expect(scrollDiv.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));

        // target ref didn't change so scroll should not have been called again
        rerender();
        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(1);

        targetDiv = createDiv();
        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        // target ref changed so scroll should have been called again
        expect(scrollDiv.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
    });

    test('does not pause autoscrolling while autoscrolling', async () => {
        const { result } = renderHook(() => useAutoScroll());
        const { scrollContainerRef, targetRef } = result.current;
        const scrollDiv = createScrollContainer();
        updateRef(scrollContainerRef, scrollDiv);
        const targetDiv = createDiv();

        // target ref was null so scroll shouldn't have been called
        expect(scrollDiv.scrollTo).not.toHaveBeenCalled();

        // Rerender with the refs set so we get to an initial autoscrolled state
        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        expect(scrollDiv.scrollTo).toHaveBeenCalled();

        // Reset the mocks
        setOutsideContainer(targetDiv);
        setScrollContainer(scrollDiv);

        // Scroll event happens while we are still auto scrolling
        fireEvent.scroll(scrollDiv);
        expect(targetDiv.getBoundingClientRect).not.toHaveBeenCalled();
        expect(scrollDiv.getBoundingClientRect).not.toHaveBeenCalled();

        // Finish auto scrolling, and then fire a scroll event (user manually scrolled)
        await finishScrolling(result.current);
        fireEvent.scroll(scrollDiv);
        expect(targetDiv.getBoundingClientRect).toHaveBeenCalled();
        expect(scrollDiv.getBoundingClientRect).toHaveBeenCalled();
    });

    test('can manually scroll to specific position', () => {
        const { result } = renderHook(() => useAutoScroll());
        const { scrollContainerRef } = result.current;
        const scrollDiv = createScrollContainer();
        updateRef(scrollContainerRef, scrollDiv);

        // target ref was null so scroll shouldn't have been called
        expect(scrollDiv.scrollTo).not.toHaveBeenCalled();
        result.current.scroll({ top: 10 });
        expect(scrollDiv.scrollTo).toHaveBeenCalledWith({ top: 10 });
    });

    test('can manually scroll into view', () => {
        const { result } = renderHook(() => useAutoScroll());
        const { scrollContainerRef, targetRef } = result.current;
        const scrollDiv = createScrollContainer();
        updateRef(scrollContainerRef, scrollDiv);
        const targetDiv = createDiv();

        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);

        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(1);

        setOutsideContainer(targetDiv);
        result.current.scroll();
        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(2);
    });

    test('can manually scroll into view only if needed', () => {
        const { result } = renderHook(() => useAutoScroll());
        const { scrollContainerRef, targetRef } = result.current;
        const scrollDiv = createScrollContainer();
        updateRef(scrollContainerRef, scrollDiv);
        const targetDiv = createDiv();

        setOutsideContainer(targetDiv);
        updateRef(targetRef, targetDiv);
        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(1);

        // Set the target inside of the scroll container
        setInsideContainer(targetDiv);
        result.current.scroll({ onlyIfNeeded: true });
        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(1);

        // Set the target outside of the scroll container
        setOutsideContainer(targetDiv);
        result.current.scroll({ onlyIfNeeded: true });
        expect(scrollDiv.scrollTo).toHaveBeenCalledTimes(2);
    });
});
