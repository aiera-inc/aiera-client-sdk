import { useEffect, useRef, RefObject } from 'react';

/**
 * Handles automatically adding/removing event listeners from DOM elements.
 * @param eventName  - The event to listen on
 * @param handler    - The listener function, receives the event that was triggered
 * @param evement    - Ref to the DOM element, or window if none provided
 */
export function useEventListener<T extends HTMLElement = HTMLDivElement>(
    eventName: keyof WindowEventMap,
    handler: (event: Event) => void,
    element?: RefObject<T>
): void {
    // Create a ref that stores handler
    const savedHandler = useRef<(event: Event) => void>();

    useEffect(() => {
        // Define the listening target
        const targetElement: T | Window = element?.current || window;
        if (!(targetElement && targetElement.addEventListener)) {
            return;
        }

        // Update saved handler if necessary
        if (savedHandler.current !== handler) {
            savedHandler.current = handler;
        }

        // Create event listener that calls handler function stored in ref
        const eventListener = (event: Event) => {
            // eslint-disable-next-line no-extra-boolean-cast
            if (!!savedHandler?.current) {
                savedHandler.current(event);
            }
        };

        targetElement.addEventListener(eventName, eventListener);

        // Remove event listener on cleanup
        return () => {
            targetElement.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element, handler]);
}