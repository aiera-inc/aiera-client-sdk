import React, { FC, ReactElement, MouseEvent } from 'react';
import { ScheduledAudioCall as Event } from 'types/generated';
import './styles.css';

export interface Props {
    events?: Event[];
    onSelectEvent?: (event: MouseEvent) => void;
}

export const EventList: FC<Props> = (props: Props): ReactElement => {
    const { events, onSelectEvent } = props;
    return events && events.length ? (
        <ul>
            {events.map((event) => (
                <li onClick={onSelectEvent} key={event.id}>
                    {event.equity?.localTicker} - {event.title}
                </li>
            ))}
        </ul>
    ) : (
        <span>No events.</span>
    );
};
