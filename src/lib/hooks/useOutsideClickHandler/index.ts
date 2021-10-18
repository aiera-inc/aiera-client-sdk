import { useEffect, RefObject } from 'react';

/**
 * This is a utility for tracking clicks outside of
 * a set of elements.
 *
 * ```typescript
 * const MyComponent = () => {
 *     const ref = useRef<HTMLDivElement>(null);
 *     useOutsideClickHandler(
 *         [ref],
 *         useCallback(() => {
 *             alert('Clicked outside!');
 *         }, [])
 *     );
 *
 *     return (
 *         <div className="outside">
 *             outside
 *             <div className="inside" ref={ref}>inside</div>
 *         </div>
 *     );
 * };
 * ```
 *
 * @param refs - A list of react refs to components that when clicked will NOT
 *               fire the outsideClickHandler
 * @param outsideClickHandler - The handler to run when an element outside of `refs`
 *                              is clicked.
 */
export function useOutsideClickHandler(
    refs: RefObject<HTMLElement | null | undefined>[],
    outsideClickHandler: (event: MouseEvent) => void
): void {
    return useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (event?.target instanceof Node) {
                // Unfortunately need to cast to Node here since the React and DOM typings don't
                // handle this well: https://stackoverflow.com/questions/61164018/typescript-ev-target-and-node-contains-eventtarget-is-not-assignable-to-node
                const isInside = refs.some((ref) => ref.current?.contains(event?.target as Node));
                if (!isInside) {
                    outsideClickHandler(event);
                }
            }
        };
        document.addEventListener('mousedown', handler);

        return () => {
            document.removeEventListener('mousedown', handler);
        };
    }, [...refs, outsideClickHandler]);
}
