import React, { createContext, useEffect, useState, useContext, ReactNode, ReactElement, useCallback } from 'react';
import gql from 'graphql-tag';
import Pusher from 'pusher-js';
import merge from 'lodash.merge';

import { useQuery } from '@aiera/client-sdk/api/client';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useAppConfig } from '@aiera/client-sdk/lib/data';
import { AppConfigQuery, RealtimeCurrentUserQuery } from '@aiera/client-sdk/types/generated';

type AppConfiguration = AppConfigQuery['configuration'];
type RealtimeCurrentUser = RealtimeCurrentUserQuery['currentUser'];

export type Realtime = Pusher;

export const Context = createContext<Realtime | undefined>(undefined);

export function Provider({ children, client: passedClient }: { children: ReactNode; client?: Pusher }): ReactElement {
    const [client, setClient] = useState<Realtime | undefined>(passedClient);

    // Keep current user and Pusher config in state
    // If the config isn't set, wait until user is authed to refetch
    // And only then set the Pusher client
    const [appConfig, setAppConfig] = useState<AppConfiguration | undefined>(undefined);
    const [currentUser, setCurrentUser] = useState<RealtimeCurrentUser | undefined>(undefined);

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
        if (!currentUser) {
            if (userQuery.status === 'success' && userQuery.state.data?.currentUser?.id) {
                setCurrentUser(userQuery.state.data.currentUser);
            } else if (userQuery.status === 'error') {
                // Wait a tick before refetching to let the state update finish (avoids extra queries)
                setTimeout(() => userQuery.refetch({ requestPolicy: 'cache-and-network' }), 100);
            }
        }
    }, [currentUser, userQuery.state.data?.currentUser, userQuery.status]);

    const configQuery = useAppConfig();
    useEffect(() => {
        if (!appConfig && currentUser) {
            if (configQuery.status === 'success' && configQuery.state.data?.configuration) {
                setAppConfig(configQuery.state.data.configuration);
            } else if (
                configQuery.status === 'error' ||
                (configQuery.status === 'success' && !configQuery.data?.configuration)
            ) {
                // Wait a tick before refetching to let the state update finish (avoids extra queries)
                setTimeout(() => configQuery.refetch(), 100);
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
    }, [appConfig, client, passedClient, realtimeOptions]);

    return <Context.Provider value={client}>{children}</Context.Provider>;
}

export function useRealtime(): Realtime | undefined {
    return useContext(Context);
}

export function useRealtimeEvent<T>(channelName: string, eventName: string, callback: (data?: T) => void): void {
    const client = useRealtime();

    // Stabilize the callback reference
    const stableCallback = useCallback(
        (data?: T) => {
            callback(data);
        },
        [callback]
    );

    useEffect(() => {
        if (!client) return;

        // Create a stable channel reference
        const channel = client.subscribe(channelName);

        // Bind the event handler
        channel.bind(eventName, stableCallback);

        // Cleanup function
        return () => {
            channel.unbind(eventName, stableCallback);
            client.unsubscribe(channelName);
        };
    }, [client, channelName, eventName, stableCallback]); // Include stableCallback in deps
}
