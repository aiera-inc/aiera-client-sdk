import { useState, useEffect, RefObject, useRef } from 'react';

/** @notExported */
interface Position {
    x: number;
    y: number;
}

export type OnDragStart = (event: MouseEvent | TouchEvent, setPosition: (pos: Position) => void) => void;
export type OnDragEnd = (event: MouseEvent | TouchEvent) => void;
export interface DragOptions {
    dragTarget: RefObject<HTMLElement>;
    onDragStart?: OnDragStart;
    onDragEnd?: OnDragEnd;
}

/**
 * Handles updating on mouse/touch movement while dragging a target element.
 * @param options
 *      - dragTarget  - The target element that can be dragged
 *      - onDragStart - Called when the element is clicked/touched, is passed the event and
 *                      function that takes in {x, y} to set the initial position.
 *      - onDragEnd   - Called on mouseup/touchend and is passed the event
 */
export function useDrag(dragOpts: DragOptions): [boolean, number, number] {
    const { dragTarget, onDragStart, onDragEnd } = dragOpts;
    const [isDragging, setIsDragging] = useState(false);
    const [initialPos, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [movePos, setMovement] = useState<Position>({ x: 0, y: 0 });
    const lastTouchPosition = useRef<Position | null>(null);

    useEffect(() => {
        function onMouseDown(event: MouseEvent) {
            onDragStart?.(event, setPosition);
            setIsDragging(true);
        }

        function onTouchStart(event: TouchEvent) {
            if (event.touches.length === 1) {
                event.preventDefault();
                onDragStart?.(event, setPosition);
                const touch = event.touches[0];
                lastTouchPosition.current = { x: touch?.clientX || 0, y: touch?.clientY || 0 };
                setIsDragging(true);
            }
        }

        function onMouseMove(event: MouseEvent) {
            if (isDragging) {
                setMovement((prevMovement) => ({
                    x: prevMovement.x + event.movementX,
                    y: prevMovement.y + event.movementY,
                }));
            }
        }

        function onTouchMove(event: TouchEvent) {
            if (isDragging && event.touches.length === 1) {
                event.preventDefault();
                const touch = event.touches[0];
                const currentPosition = { x: touch?.clientX || 0, y: touch?.clientY || 0 };

                if (lastTouchPosition.current) {
                    // Calculate the delta (movement) manually
                    const deltaX = currentPosition.x - lastTouchPosition.current.x;
                    const deltaY = currentPosition.y - lastTouchPosition.current.y;

                    setMovement((prevMovement) => ({
                        x: prevMovement.x + deltaX,
                        y: prevMovement.y + deltaY,
                    }));
                }

                // Update last position
                lastTouchPosition.current = currentPosition;
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

        function onTouchEnd(event: TouchEvent) {
            if (isDragging) {
                event.preventDefault();
                onDragEnd?.(event);
                setIsDragging(false);
                setPosition({ x: 0, y: 0 });
                setMovement({ x: 0, y: 0 });
                lastTouchPosition.current = null;
            }
        }

        const target = dragTarget.current;
        if (target) {
            // Mouse events
            target.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            // Touch events
            target.addEventListener('touchstart', onTouchStart, { passive: false });
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd, { passive: false });
        }

        return () => {
            if (target) {
                // Remove mouse events
                target.removeEventListener('mousedown', onMouseDown);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                // Remove touch events
                target.removeEventListener('touchstart', onTouchStart);
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
            }
        };
    }, [dragTarget.current, isDragging, onDragStart, onDragEnd]);

    return [isDragging, initialPos.x + movePos.x, initialPos.y + movePos.y];
}
