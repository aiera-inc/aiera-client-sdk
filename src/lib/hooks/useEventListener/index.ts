import { useEffect, useRef, RefObject } from 'react';

/**
 * Handles automatically adding/removing event listeners from DOM elements.
 * @param eventName  - The event to listen on
 * @param handler    - The listener function, receives the event that was triggered
 * @param targetRef  - Ref to the DOM element
 */
export function useElementListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLDivElement>(
    eventName: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    targetRef: RefObject<T>
): void {
    // Create a ref that stores handler
    const savedHandler = useRef<(event: HTMLElementEventMap[K]) => void>();

    useEffect(() => {
        savedHandler.current = handler;

        // Create event listener that calls handler function stored in ref
        const eventListener = (event: HTMLElementEventMap[K]) => {
            // eslint-disable-next-line no-extra-boolean-cast
            if (!!savedHandler?.current) {
                savedHandler.current(event);
            }
        };

        targetRef.current?.addEventListener(eventName, eventListener);

        // Remove event listener on cleanup
        return () => {
            targetRef.current?.removeEventListener(eventName, eventListener);
        };
    }, [eventName, targetRef.current, handler]);
}

/**
 * Handles automatically adding/removing event listeners on the window
 * @param eventName  - The event to listen on
 * @param handler    - The listener function, receives the event that was triggered
 */
export function useWindowListener<K extends keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void
): void {
    // Create a ref that stores handler
    const savedHandler = useRef<(event: WindowEventMap[K]) => void>();

    useEffect(() => {
        savedHandler.current = handler;

        // Create event listener that calls handler function stored in ref
        const eventListener = (event: WindowEventMap[K]) => {
            // eslint-disable-next-line no-extra-boolean-cast
            if (!!savedHandler?.current) {
                savedHandler.current(event);
            }
        };

        window.addEventListener(eventName, eventListener);

        // Remove event listener on cleanup
        return () => {
            window.removeEventListener(eventName, eventListener);
        };
    }, [eventName, handler]);
}

/**
 * Handles automatically adding/removing event listeners on the window
 * @param eventName  - The event to listen on
 * @param handler    - The listener function, receives the event that was triggered
 */
export function useDocumentListener<K extends keyof DocumentEventMap>(
    eventName: K,
    handler: (event: DocumentEventMap[K]) => void
): void {
    // Create a ref that stores handler
    const savedHandler = useRef<(event: DocumentEventMap[K]) => void>();

    useEffect(() => {
        savedHandler.current = handler;

        // Create event listener that calls handler function stored in ref
        const eventListener = (event: DocumentEventMap[K]) => {
            // eslint-disable-next-line no-extra-boolean-cast
            if (!!savedHandler?.current) {
                savedHandler.current(event);
            }
        };

        document.addEventListener(eventName, eventListener);

        // Remove event listener on cleanup
        return () => {
            document.removeEventListener(eventName, eventListener);
        };
    }, [eventName, handler]);
}
