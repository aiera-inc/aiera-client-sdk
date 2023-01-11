/**
 * Utilities for working with data from GQL Query responses.
 * @module
 */
import { useCallback, useEffect, useState } from 'react';
import gql from 'graphql-tag';
import { useClient } from 'urql';
import type { InstrumentID } from '@finos/fdc3';
import { ChangeHandlers, DeepPartial, Instrument, Maybe, Quote, ValueOf } from '@aiera/client-sdk/types';
import {
    AppConfigQuery,
    AppConfigQueryVariables,
    CompanyResolutionQuery,
    CompanyResolutionQueryVariables,
    TrackMutation,
    TrackMutationVariables,
    User,
    UserStatusQuery,
    UserStatusQueryVariables,
} from '@aiera/client-sdk/types/generated';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useStorage } from '@aiera/client-sdk/lib/storage';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';

export function getEventCreatorName(creator?: User | null): string {
    let createdBy = '';
    if (creator) {
        if (creator.firstName) {
            createdBy = creator.firstName;
        }
        if (creator.lastName) {
            createdBy = `${createdBy} ${creator.lastName.slice(0, 1)}.`;
        }
        if (!createdBy) {
            createdBy = creator.primaryEmail || creator.username;
        }
    }
    return createdBy;
}

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

export function useCompanyResolver(): (
    identifier: InstrumentID
) => Promise<CompanyResolutionQuery['companies'] | undefined> {
    const client = useClient();
    return useCallback(
        async (identifier: InstrumentID) => {
            // InstrumentID can support a bunch of different identifiers, but just grab
            // the first one we find and use it.
            const id = Object.values(identifier)[0] as ValueOf<InstrumentID>;
            if (!id) return Promise.reject('No identifier to resolve');

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
                    { identifier: id }
                )
                .toPromise();
            return result?.data?.companies;
        },
        [client]
    );
}

export function useUserStatus(): (email: string) => Promise<UserStatusQuery | undefined> {
    const client = useClient();
    return useCallback(
        async (email: string) => {
            const result = await client
                .query<UserStatusQuery, UserStatusQueryVariables>(
                    gql`
                        query UserStatus($email: String!) {
                            userStatus(email: $email) {
                                active
                                status
                            }
                        }
                    `,
                    { email }
                )
                .toPromise();
            return result.data;
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

type TrackingEvent = 'Click' | 'View' | 'Scroll' | 'Submit' | 'Load';
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
    | 'Audio Stop'
    | 'User Status'
    | 'News'
    | 'News Search';

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
    syncWatchlist: boolean;
}

export const defaultSettings = {
    darkMode: false,
    textSentiment: true,
    tonalSentiment: true,
    syncWatchlist: true,
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

interface AlertHash {
    [date: string]: string[];
}

interface AlertEventMetaData {
    ticker: string;
}

interface AlertEvents {
    [id: string]: AlertEventMetaData;
}

export interface AlertList {
    dates: AlertHash;
    events: AlertEvents;
}

export const defaultAlertList = {
    dates: {},
    events: {},
};

export function useAlertList(
    poll = false,
    interval = 3000
): {
    alertList: AlertList;
    addAlert: (date: string, id: string, metaData?: AlertEventMetaData) => void;
    removeAlert: (date: string, id: string) => void;
    removeDateKey: (date: string) => void;
    loadAlertList: () => Promise<void>;
} {
    const storage = useStorage();
    const [alertList, setAlertList] = useState<AlertList>(defaultAlertList);

    // The time of the event(s) has come (most likely),
    // so we are being told to remove the dynamic date (as an obj property)
    const removeDateKey = useCallback(
        (date: string) => {
            setAlertList((state) => {
                const cleanState: AlertList = { dates: { ...state.dates }, events: { ...state.events } };
                const eventIds = cleanState.dates[date];
                if (eventIds?.length) {
                    eventIds.forEach((id: number | string) => {
                        delete cleanState.events[id];
                    });
                    delete cleanState.dates[date];
                }
                try {
                    void storage.put('alertList', JSON.stringify(cleanState));
                } catch (_error) {
                    // Nothing to do here, it just wont save
                }
                return cleanState;
            });
        },
        [storage, setAlertList]
    );

    const updateAlertList = useCallback(
        (date: string, id: string, action, metaData?: AlertEventMetaData) => {
            setAlertList((state: AlertList) => {
                const cleanState: AlertList = {
                    dates: {
                        ...state.dates,
                    },
                    events: {
                        ...state.events,
                    },
                };

                if (action === 'add') {
                    const dates = cleanState.dates[date];
                    if (dates?.length) {
                        cleanState.dates[date] = [...new Set<string>([...dates, id])];
                    } else {
                        cleanState.dates[date] = [id];
                    }
                    if (metaData) {
                        cleanState.events[id] = { ...metaData };
                    }
                } else {
                    if (cleanState.dates[date]) {
                        const ids = new Set<string>(cleanState.dates[date]);
                        ids.delete(id);
                        if (ids.size === 0) {
                            delete cleanState.dates[date];
                        } else {
                            cleanState.dates[date] = [...ids];
                        }
                    }
                    delete cleanState.events[id];
                }

                try {
                    void storage.put('alertList', JSON.stringify(cleanState));
                } catch (_error) {
                    // Nothing to do here, it just wont save
                }
                return cleanState;
            });
        },
        [storage, setAlertList]
    );

    const addAlert = (date: string, id: string, metaData?: AlertEventMetaData) =>
        updateAlertList(date, id, 'add', metaData);
    const removeAlert = (date: string, id: string) => updateAlertList(date, id, 'remove');

    const loadAlertList = useCallback(async () => {
        return storage.get('alertList').then((value) => {
            let newValue = JSON.parse(value || '{}') as AlertList;
            const dateKeys = Object.keys(newValue.dates || {});
            if (!dateKeys || dateKeys.length === 0) {
                newValue = defaultAlertList;
            }
            try {
                setAlertList(newValue);
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

    // Check AlertList against current time
    // and fire events
    const bus = useMessageBus();
    useEffect(() => {
        if (poll) {
            const dateKeys = Object.keys(alertList.dates);
            //const events = eventsQuery.data.events;

            const checkAlerts = setInterval(() => {
                const currentTime = new Date().getTime();
                let fireAlert = false;
                let eventIds: string[] = [];
                dateKeys.forEach((dk) => {
                    if (currentTime > new Date(dk).getTime()) {
                        const difference = currentTime - new Date(dk).getTime();
                        // We'll only fire an alert if the event started within 2 hours
                        if (!fireAlert && difference < 7200000) fireAlert = true;
                        const ids = alertList.dates[dk];
                        if (ids?.length) eventIds = eventIds.concat(ids);
                        removeDateKey(dk);
                    }
                });

                const tickerList: string[] = [];
                eventIds.forEach((id) => {
                    const localTicker = alertList.events[id]?.ticker;
                    if (localTicker) {
                        tickerList.push(localTicker);
                    }
                });

                // Fire alert with description
                // tickers, and eventIds
                if (fireAlert) {
                    bus?.emit(
                        'event-alert',
                        {
                            description: `${tickerList.length > 1 ? 'Events' : 'Event'} starting for ${tickerList.join(
                                ', '
                            )}`,
                            tickerList,
                            eventIds,
                        },
                        'out'
                    );
                }
            }, interval);

            return () => clearInterval(checkAlerts);
        }

        return () => true;
    }, [poll, alertList]);

    return { alertList, addAlert, removeAlert, removeDateKey, loadAlertList };
}

export function usePlaySound(url = 'https://public.aiera.com/notification.wav'): { playSound: () => void } {
    const audioObj = new Audio(url);

    const playSound = () => {
        if (audioObj.readyState > 2) {
            void audioObj.play();
        }
    };

    return { playSound };
}
