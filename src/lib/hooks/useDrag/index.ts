import { useState, useEffect, RefObject } from 'react';

/** @notExported */
interface Position {
    x: number;
    y: number;
}

export type OnDragStart = (event: MouseEvent, setPosition: (pos: Position) => void) => void;
export type OnDragEnd = (event: MouseEvent) => void;
export interface DragOptions {
    dragTarget: RefObject<HTMLElement>;
    onDragStart?: OnDragStart;
    onDragEnd?: OnDragEnd;
}

/**
 * Handles updating on mouse movement while dragging a target element.
 * @param options
 *      - dragTarget  - The target element that can be dragged
 *      - onDragStart - Called when the element is clicked, is passed the event and
 *                      function that takes in {x, y} to set the initial position.
 *      - onDragEnd   - Called on mouseup and is passed the event
 */
export function useDrag(dragOpts: DragOptions): [boolean, number, number] {
    const { dragTarget, onDragStart, onDragEnd } = dragOpts;
    const [isDragging, setIsDragging] = useState(false);
    const [initialPos, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [movePos, setMovement] = useState<Position>({ x: 0, y: 0 });

    useEffect(() => {
        function onMouseDown(event: MouseEvent) {
            onDragStart?.(event, setPosition);
            setIsDragging(true);
        }
        function onMouseMove(event: MouseEvent) {
            if (isDragging) {
                setMovement((prevMovement) => ({
                    x: prevMovement.x + event.movementX,
                    y: prevMovement.y + event.movementY,
                }));
            }
        }
        function onMouseUp(event: MouseEvent) {
            if (isDragging) {
                onDragEnd?.(event);
                setIsDragging(false);
                setPosition({ x: 0, y: 0 });
                setMovement({ x: 0, y: 0 });
            }
        }
        if (dragTarget.current) {
            dragTarget.current.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            if (dragTarget.current) {
                dragTarget.current.removeEventListener('mousedown', onMouseDown);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        };
    }, [dragTarget.current, isDragging]);

    return [isDragging, initialPos.x + movePos.x, initialPos.y + movePos.y];
}
