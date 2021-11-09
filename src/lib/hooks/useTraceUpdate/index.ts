import { useEffect, useRef } from 'react';

/**
 *  A hook that logs when a component mounts
 */
export function useTraceUpdate(props: { [key: string]: unknown }): void {
    const prev = useRef(props);
    useEffect(() => {
        const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
            if (prev.current[k] !== v) {
                ps[k] = [prev.current[k], v];
            }
            return ps;
        }, {} as { [key: string]: unknown });
        if (Object.keys(changedProps).length > 0) {
            console.log('Changed props:', changedProps);
        }
        prev.current = props;
    });
}
