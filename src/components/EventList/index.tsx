import React, { FC, ReactElement, MouseEvent } from 'react';
import { Event } from 'types';
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
                    {event.ticker} - {event.title}
                </li>
            ))}
        </ul>
    ) : (
        <span>No events.</span>
    );
};
