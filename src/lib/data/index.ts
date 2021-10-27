/**
 * Utilities for working with data from GQL Query responses.
 * @module
 */
import { useCallback, useEffect } from 'react';
import gql from 'graphql-tag';
import { useClient } from 'urql';
import { DeepPartial, Instrument, Maybe, Quote } from '@aiera/client-sdk/types';
import {
    CompanyResolutionQuery,
    CompanyResolutionQueryVariables,
    TrackMutation,
    TrackMutationVariables,
} from '@aiera/client-sdk/types/generated';
import { useConfig } from '@aiera/client-sdk/lib/config';

/**
 * Utilities for working with quotes/instruments
 */
interface Primary {
    isPrimary: boolean;
}
function sortByPrimary(a: Primary, b: Primary) {
    return Number(b.isPrimary) - Number(a.isPrimary);
}

/**
 * For the primary quote, US based takes precendence, then isPrimary field on both
 * intrument and quote, and finally the first intrument/quote we find if nothing else.
 *
 * To do this, sort all the primary instruments to the front, then sort the primary quotes
 * for each. This gives us a primary sorted array of quotes.
 * 1. Use the first US based quote if we have one
 * 2. Otherwise use the first primary quote if we have one
 * 2. Otherwise just use the first quote we have
 */
export function getPrimaryQuote(
    company: Maybe<{
        instruments: (Pick<Instrument, 'isPrimary'> & {
            quotes: (Pick<Quote, 'isPrimary'> & { exchange: { country: { countryCode: string } } })[];
        })[];
    }>
): Maybe<DeepPartial<Quote>> {
    const quotes = company?.instruments
        ?.sort(sortByPrimary)
        .flatMap((instrument) => instrument.quotes)
        .sort(sortByPrimary);
    const primaryQuote = quotes?.find((quote) => quote.exchange.country.countryCode === 'US');
    return primaryQuote || quotes?.[0];
}

export function useCompanyResolver(): (identifier: string) => Promise<CompanyResolutionQuery['companies'] | undefined> {
    const client = useClient();
    return useCallback(
        async (identifier: string) => {
            const result = await client
                .query<CompanyResolutionQuery, CompanyResolutionQueryVariables>(
                    gql`
                        query CompanyResolution($identifier: String!) {
                            companies(filter: { resolution: { identifier: $identifier, identifierType: unknown } }) {
                                id
                                commonName
                                instruments {
                                    id
                                    isPrimary
                                    quotes {
                                        id
                                        isPrimary
                                        localTicker
                                        exchange {
                                            id
                                            shortName
                                            country {
                                                id
                                                countryCode
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    `,
                    { identifier }
                )
                .toPromise();
            return result?.data?.companies;
        },
        [client]
    );
}

type TrackingEvent = 'Click' | 'View' | 'Scroll' | 'Submit';
type TrackingObject =
    | 'Event'
    | 'Event Filter By'
    | 'Event Search'
    | 'Audio Pause'
    | 'Audio Play'
    | 'Audio Fast Forward'
    | 'Audio Rewind'
    | 'Audio Playback Rate'
    | 'Audio Start'
    | 'Audio Over'
    | 'Audio Stop';

/**
 * Returns a function that can be used tp track specific events with the app.
 *
 * The returned track function takes teh following params:
 * @param event      - The event type, we have normalized these to `Click`, `View`, `Scroll` and `Submit`
 * @param object     - The thing the event is taking place on, ie. an `Event` like an earnings event
 * @param properties - A map/dictionary of additional information abotu the event, such as the component
 *                     name, the object id, etc.
 */
export function useTrack(): (
    event: TrackingEvent,
    object: TrackingObject,
    properties: { [key: string]: unknown }
) => Promise<void> {
    const client = useClient();
    const config = useConfig();
    const track = useCallback(
        async (event: TrackingEvent, object: TrackingObject, properties: { [key: string]: unknown }) => {
            await client
                .mutation<TrackMutation, TrackMutationVariables>(
                    gql`
                        mutation Track($event: String!, $properties: GenericObjectScalar!) {
                            track(event: $event, properties: $properties) {
                                success
                            }
                        }
                    `,
                    {
                        event: `${event} | ${object}`,
                        properties: {
                            moduleName: config.moduleName,
                            platform: config.platform,
                            ...properties,
                        },
                    }
                )
                .toPromise();
        },
        [client]
    );

    return track;
}

/**
 * Automatically tracks an event when the deps change.
 *
 * @param event      - The event type, we have normalized these to `Click`, `View`, `Scroll` and `Submit`
 * @param object     - The thing the event is taking place on, ie. an `Event` like an earnings event
 * @param properties - A map/dictionary of additional information abotu the event, such as the component
 *                     name, the object id, etc.
 * @param skip       - Dont track if this is true
 */
export function useAutoTrack(
    event: TrackingEvent,
    object: TrackingObject,
    properties: { [key: string]: unknown },
    deps: ReadonlyArray<unknown> = [],
    skip = false
): void {
    const track = useTrack();
    useEffect(() => {
        if (!skip) {
            void track(event, object, properties);
        }
    }, [track, event, object, skip, ...deps]);
}
