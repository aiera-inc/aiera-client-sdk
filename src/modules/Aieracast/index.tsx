import React, { ReactElement, useCallback, useState } from 'react';
import './styles.css';
import { EventList, EventRowProps } from '../EventList';
import { Transcript } from '../Transcript';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';

interface AieracastSharedProps {}

/** @notExported */
interface AieracastUIProps extends AieracastSharedProps {
    openEventIds: string[];
    toggleEvent: (id: string) => void;
}

export function AieracastUI(props: AieracastUIProps): ReactElement {
    const { openEventIds, toggleEvent } = props;

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
        <div className="flex relative h-full">
            <div className="absolute inset-0 flex">
                <div className="h-full w-80 flex-shrink-0 ">
                    <EventList EventRow={EventRow} />
                </div>
                <div className="flex overflow-x-auto">
                    {openEventIds.map((id) => (
                        <div key={id} className="h-full w-80 flex-shrink-0">
                            <Transcript eventId={id} />
                        </div>
                    ))}
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
    return <AieracastUI openEventIds={openEventIds} toggleEvent={toggleEvent} />;
}
