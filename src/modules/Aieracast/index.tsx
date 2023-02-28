import React, { ReactElement, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import { EventList, EventRowProps } from '../EventList';
import { Transcript } from '../Transcript';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';

interface AieracastSharedProps {}

/** @notExported */
interface AieracastUIProps extends AieracastSharedProps {
    openEventIds: string[];
    toggleEvent: (id: string) => void;
    scrollRef: RefObject<HTMLDivElement>;
}

export function AieracastUI(props: AieracastUIProps): ReactElement {
    const { openEventIds, toggleEvent, scrollRef } = props;

    function EventRow({ event }: EventRowProps) {
        const eventId = event.id;
        const primaryQuote = getPrimaryQuote(event.primaryCompany);
        return (
            <div onClick={() => toggleEvent(eventId)} className="flex">
                <p>{primaryQuote?.localTicker}</p>
                <p>{event.eventType}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col relative h-full">
            <div className="flex-1 relative">
                <div className="absolute inset-0 flex">
                    <div className="h-full w-[23rem] flex-shrink-0 ">
                        <EventList hidePlaybar EventRow={EventRow} />
                    </div>
                    <div className="flex overflow-x-auto" ref={scrollRef}>
                        {openEventIds.map((id) => (
                            <div key={id} className="h-full w-[23rem] flex-shrink-0">
                                <Transcript eventId={id} hidePlaybar />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** @notExported */
export interface AieracastProps extends AieracastSharedProps {}

/**
 * Renders Aieracast
 */
export function Aieracast(): ReactElement {
    const [openEventIds, openEventIdsState] = useState<string[]>([]);
    const [storedScrollWidth, setScrollWidthState] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const toggleEvent = useCallback(
        (eventId) => {
            const uniqueIds = new Set(openEventIds);
            if (typeof eventId === 'string') {
                if (uniqueIds.has(eventId)) {
                    uniqueIds.delete(eventId);
                } else {
                    uniqueIds.add(eventId);
                }
                openEventIdsState([...uniqueIds]);
            }
        },
        [openEventIds]
    );

    // Scroll to added event
    useEffect(() => {
        const scrollWidth = scrollRef.current?.scrollWidth;
        if (scrollWidth && scrollWidth > storedScrollWidth) {
            if (scrollRef.current) {
                const width = scrollRef.current.scrollWidth;
                scrollRef.current.scrollTo({ left: width, behavior: 'smooth' });
            }
        }
        if (typeof scrollWidth === 'number') {
            setScrollWidthState(scrollWidth);
        }
    }, [scrollRef.current?.scrollWidth, openEventIds]);
    return <AieracastUI openEventIds={openEventIds} scrollRef={scrollRef} toggleEvent={toggleEvent} />;
}
