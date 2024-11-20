import { QueryResult, useQuery } from '@aiera/client-sdk/api/client';
import { EventView, EventsQuery, EventsQueryVariables } from '@aiera/client-sdk/types';
import { gql } from 'urql';
const eventsGQL = (type = '') => gql`
        query Events${type}($filter: EventFilter, $view: EventView!) {
            events(filter: $filter, view: $view) {
                id
                hasPublishedTranscript
                hasTranscript
                eventDate
                eventType
                isLive
                title
            }
        }
    `;

export function useEvents(searchTerm?: string) {
    const eventsQuery: QueryResult<EventsQuery, EventsQueryVariables> = useQuery<EventsQuery, EventsQueryVariables>({
        pause: !searchTerm,
        variables: {
            view: EventView.Recent,
            filter: {
                hasTranscript: true,
                title: searchTerm,
            },
        },
        query: eventsGQL(),
    });

    return { eventsQuery };
}
