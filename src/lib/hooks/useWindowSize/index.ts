import { useLayoutEffect, useState } from 'react';

/**
 * Returns the current window size and updates when the screen is resized.
 */
export function useWindowSize(): { height: number; width: number } {
    const [size, setSize] = useState({
        height: window.innerHeight,
        width: window.innerWidth,
    });

    const onResize = () =>
        setSize({
            height: window.innerHeight,
            width: window.innerWidth,
        });

    useLayoutEffect(() => {
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return size;
}
