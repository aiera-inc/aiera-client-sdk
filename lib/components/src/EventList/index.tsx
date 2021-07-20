import { FC, ReactElement } from "react";

interface Event {
  id: string;
  title: string;
  ticker: string;
}

interface Props {
  events: Event[];
}

export const EventList: FC<Props> = (props: Props): ReactElement => (
  <ul>
    {props.events.map((event) => (
      <li key={event.id}>
        {event.ticker} - {event.title}
      </li>
    ))}
  </ul>
);
