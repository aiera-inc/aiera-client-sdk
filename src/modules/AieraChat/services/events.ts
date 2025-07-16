import { gql } from 'urql';
import { QueryResult, useQuery } from '@aiera/client-sdk/api/client';
import { SearchEventsQuery, SearchEventsQueryVariables } from '@aiera/client-sdk/types/generated';

const eventsGQL = (type = '') => gql`
        query SearchEvents${type}($filter: OpenSearchEventFilter!) {
            openSearch {
                events(filter: $filter) {
                    id
                    hits {
                        id
                        event {
                            id
                            eventDate
                            eventId
                            eventTitle
                            eventType
                        }
                    }
                    numTotalHits
                }
            }
        }
    `;

export function useEvents(searchTerm?: string) {
    const eventsQuery: QueryResult<SearchEventsQuery, SearchEventsQueryVariables> = useQuery<
        SearchEventsQuery,
        SearchEventsQueryVariables
    >({
        pause: !searchTerm,
        variables: {
            filter: {
                searchTerm: searchTerm || '',
            },
        },
        query: eventsGQL(),
    });

    return { eventsQuery };
}
