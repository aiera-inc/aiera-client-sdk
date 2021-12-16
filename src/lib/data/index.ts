/**
 * Utilities for working with data from GQL Query responses.
 * @module
 */
import { useCallback, useEffect, useState } from 'react';
import gql from 'graphql-tag';
import { useClient } from 'urql';
import { ChangeHandlers, DeepPartial, Instrument, Maybe, Quote } from '@aiera/client-sdk/types';
import {
    AppConfigQuery,
    AppConfigQueryVariables,
    CompanyResolutionQuery,
    CompanyResolutionQueryVariables,
    ContentSource,
    TrackMutation,
    TrackMutationVariables,
} from '@aiera/client-sdk/types/generated';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useStorage } from '@aiera/client-sdk/lib/storage';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';

/**
 * Display labels for ContentSource types
 */
export const CONTENT_SOURCE_LABELS = {
    [ContentSource.Eventvestor]: 'EventVestor',
    [ContentSource.Lexisnexis]: 'LexisNexis',
    [ContentSource.Media]: 'Media',
    [ContentSource.Refinitiv]: 'Refinitiv',
    [ContentSource.Streetaccount]: 'StreetAccount',
    [ContentSource.User]: 'User',
};

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

export function useAppConfig(): QueryResult<AppConfigQuery, AppConfigQueryVariables> {
    return useQuery<AppConfigQuery, AppConfigQueryVariables>({
        query: gql`
            query AppConfig {
                configuration {
                    pusherAppCluster
                    pusherAppKey
                }
            }
        `,
    });
}

type TrackingEvent = 'Click' | 'View' | 'Scroll' | 'Submit';
type TrackingObject =
    | 'Content'
    | 'Content Search'
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

export interface Settings {
    darkMode: boolean;
    textSentiment: boolean;
    tonalSentiment: boolean;
}

export const defaultSettings = {
    darkMode: false,
    textSentiment: true,
    tonalSentiment: true,
};

export function useSettings(): {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    loadSettings: () => Promise<void>;
    handlers: ChangeHandlers<Settings>;
} {
    const storage = useStorage();
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    const updateSettings = useCallback(
        (newSettings: Partial<Settings>) => {
            setSettings((prevSettings) => {
                const mergedSettings = { ...prevSettings, ...newSettings };
                try {
                    void storage.put('settings', JSON.stringify(mergedSettings));
                } catch (_error) {
                    // Nothing to do here, it just wont save
                }
                return mergedSettings;
            });
        },
        [storage, setSettings]
    );

    const handlers = {} as ChangeHandlers<Settings>;
    for (const key in settings) {
        handlers[key as keyof Settings] = useCallback(
            (_, change) => updateSettings({ [key]: change.value } as Partial<Settings>),
            [settings]
        );
    }

    const loadSettings = useCallback(async () => {
        return storage.get('settings').then((value) => {
            try {
                setSettings((prevSettings) => ({ ...prevSettings, ...(JSON.parse(value || '{}') as Settings) }));
            } catch (_error) {
                // Nothing to do here, it just wont save
            }
        });
    }, [storage, setSettings]);

    useEffect(() => {
        const listener = (key: string) => {
            if (key === 'settings') void loadSettings();
        };
        storage.addListener?.(listener);
        void loadSettings();
        return () => storage.removeListener?.(listener);
    }, [loadSettings, storage]);

    return { settings, updateSettings, loadSettings, handlers };
}

export interface AlertList {
    dateKeys: string[];
    [date: string]: string[];
}

export const defaultAlertList = {
    dateKeys: [],
};

export function useAlertList(): {
    alertList: AlertList;
    addAlert: (date: string, id: string) => void;
    removeAlert: (date: string, id: string) => void;
    loadAlertList: () => Promise<void>;
} {
    const storage = useStorage();
    const [alertList, setAlertList] = useState<AlertList>(defaultAlertList);

    const updateAlertList = useCallback(
        async (date: string, id: string, action) => {
            return storage.get('alertList').then((value) => {
                try {
                    const state = JSON.parse(value || '{}') as AlertList;
                    const dateKeys = new Set<string>(state.dateKeys);
                    const ids = state[date] ? new Set<string>(state[date]) : new Set<string>();
                    const cleanState: AlertList = { ...defaultAlertList };

                    if (action === 'add') {
                        ids.add(id);
                        if (!dateKeys?.has(date)) {
                            dateKeys.add(date);
                        }
                    } else {
                        ids.delete(id);
                        if (ids.size === 0) {
                            dateKeys.delete(date);
                        }
                    }

                    // The dateKeys are the source of truth
                    // so we only pick the data where the dates are
                    dateKeys.forEach((dk: string) => {
                        if (dk !== date && state[dk]) {
                            cleanState[dk] = state[dk] || [];
                        } else if (dk === date && ids.size > 0) {
                            // For the current date, we'll use our new IDs set
                            cleanState[date] = [...ids];
                        }
                    });

                    cleanState.dateKeys = [...dateKeys];

                    try {
                        setAlertList(cleanState);
                        void storage.put('alertList', JSON.stringify(cleanState));
                    } catch (_error) {
                        // Nothing to do here, it just wont save
                    }
                } catch (_error) {
                    // Nothing to do here, it just wont save
                }
            });
        },
        [alertList, storage, setAlertList]
    );

    const addAlert = (date: string, id: string) => updateAlertList(date, id, 'add');
    const removeAlert = (date: string, id: string) => updateAlertList(date, id, 'remove');

    const loadAlertList = useCallback(async () => {
        return storage.get('alertList').then((value) => {
            try {
                setAlertList((state) => ({ ...state, ...(JSON.parse(value || '{}') as AlertList) }));
            } catch (_error) {
                // Nothing to do here, it just wont save
            }
        });
    }, [storage, setAlertList]);

    useEffect(() => {
        const listener = (key: string) => {
            if (key === 'alertList') void loadAlertList();
        };
        storage.addListener?.(listener);
        void loadAlertList();
        return () => storage.removeListener?.(listener);
    }, []);
    return { alertList, addAlert, removeAlert, loadAlertList };
}
