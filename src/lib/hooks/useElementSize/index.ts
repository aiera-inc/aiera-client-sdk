import { useLayoutEffect, useState, Ref, useRef } from 'react';
import { useWindowSize } from '@aiera/client-sdk/lib/hooks/useWindowSize';

/**
 * Returns the current element size and updates when the screen is resized.
 */
export function useElementSize(): { height: number; width: number; ref: Ref<HTMLDivElement> } {
    const ref = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({
        height: 0,
        width: 0,
    });

    // Rerender on resize to make sure we have the correct element dimensions
    const windowSize = useWindowSize();
    useLayoutEffect(() => {
        if (ref.current?.clientHeight && ref.current?.clientWidth) {
            setSize({ height: ref.current?.clientHeight, width: ref.current?.clientWidth });
        }
    }, [windowSize.height, windowSize.width]);

    return { ...size, ref };
}
