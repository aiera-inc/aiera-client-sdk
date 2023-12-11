import React, { createContext, useEffect, useState, useContext, ReactNode, ReactElement } from 'react';
import gql from 'graphql-tag';
import Pusher from 'pusher-js';
import merge from 'lodash.merge';

import { useQuery } from '@aiera/client-sdk/api/client';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useAppConfig } from '@aiera/client-sdk/lib/data';
import { AppConfigQuery, RealtimeCurrentUserQuery } from '@aiera/client-sdk/types/generated';

const REFETCH_LIMIT = 100; // after 100 failed attempts, stop querying
const REFETCH_TIMEOUT_DEFAULT = 500; // in ms
const REFETCH_TIMEOUT_LIMIT = 2000; // 2 seconds (in ms)
const REFETCH_TIMEOUT_THRESHOLD = 30;

type AppConfiguration = AppConfigQuery['configuration'];
type RealtimeCurrentUser = RealtimeCurrentUserQuery['currentUser'];

export type Realtime = Pusher;

export const Context = createContext<Realtime | undefined>(undefined);

export function Provider({ children, client: passedClient }: { children: ReactNode; client?: Pusher }): ReactElement {
    const [client, setClient] = useState<Realtime | undefined>(passedClient);

    /**
     * Keep current user and Pusher config in state.
     * If the config isn't set, wait until the user is authed to refetch.
     * And only then set the Pusher client.
     */
    const [appConfig, setAppConfig] = useState<AppConfiguration | undefined>(undefined);
    const [currentUser, setCurrentUser] = useState<RealtimeCurrentUser | undefined>(undefined);

    // Track number of RealtimeCurrentUser query refetches
    const [refetchCount, setRefetchCount] = useState<number>(0);

    // Auth needed to retrieve Pusher config from server
    const userQuery = useQuery<RealtimeCurrentUserQuery>({
        requestPolicy: 'cache-only',
        query: gql`
            query RealtimeCurrentUser {
                currentUser {
                    id
                }
            }
        `,
    });
    useEffect(() => {
        let refetchTimer: number | undefined;

        if (!currentUser) {
            if (userQuery.status === 'success' && userQuery.state.data?.currentUser?.id) {
                setCurrentUser(userQuery.state.data.currentUser);
            } else if (
                userQuery.status === 'error' ||
                (userQuery.status === 'success' && !userQuery.state.data?.currentUser?.id)
            ) {
                /**
                 * If there's an issue, don't hammer the server.
                 * Once the threshold is hit, refetch every 2 seconds.
                 * And once the limit is reached, stop refetching entirely.
                 */
                if (refetchCount < REFETCH_LIMIT) {
                    refetchTimer = window.setTimeout(
                        () => {
                            setRefetchCount(refetchCount + 1);
                            userQuery.refetch({ requestPolicy: 'cache-and-network' });
                        },
                        refetchCount < REFETCH_TIMEOUT_THRESHOLD ? REFETCH_TIMEOUT_DEFAULT : REFETCH_TIMEOUT_LIMIT
                    );
                }
            }
        }
        // Remove refetch timeout on cleanup
        return () => {
            if (refetchTimer) {
                window.clearTimeout(refetchTimer);
            }
        };
    }, [currentUser, refetchCount, userQuery.state.data?.currentUser, userQuery.status]);

    const configQuery = useAppConfig();
    useEffect(() => {
        if (!appConfig && currentUser) {
            if (configQuery.status === 'success' && configQuery.state.data?.configuration) {
                setAppConfig(configQuery.state.data.configuration);
            } else if (
                configQuery.status === 'error' ||
                (configQuery.status === 'success' && !configQuery.data?.configuration)
            ) {
                configQuery.refetch();
            }
        }
    }, [appConfig, configQuery.state.data?.configuration, configQuery.status, currentUser]);

    const { realtimeOptions } = useConfig();
    useEffect(() => {
        const appKey = appConfig?.pusherAppKey;
        const cluster = appConfig?.pusherAppCluster;
        if (!client && !passedClient && appKey && cluster) {
            setClient(new Pusher(appKey, merge({ cluster }, realtimeOptions)));
        }
    }, [appConfig, client, passedClient]);
    return <Context.Provider value={client}>{children}</Context.Provider>;
}

export function useRealtime(): Realtime | undefined {
    return useContext(Context);
}

export function useRealtimeEvent<T>(channelName: string, eventName: string, callback: (data?: T) => void): void {
    const client = useRealtime();
    useEffect(() => {
        if (!client) return;
        const channel = client.subscribe(channelName);
        channel.bind(eventName, callback);

        return () => {
            channel.unbind(eventName, callback);
            channel.unsubscribe();
        };
    }, [client, channelName, eventName, callback]);
}
