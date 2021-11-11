import React, { createContext, useEffect, useState, useContext, ReactNode, ReactElement } from 'react';
import Pusher from 'pusher-js';

import { useAppConfig } from '@aiera/client-sdk/lib/data';

export type Realtime = Pusher;

export const Context = createContext<Realtime | undefined>(undefined);

export function Provider({ children, client: passedClient }: { children: ReactNode; client?: Pusher }): ReactElement {
    const [client, setClient] = useState<Realtime | undefined>(passedClient);
    const configQuery = useAppConfig();
    useEffect(() => {
        const appKey = configQuery.state.data?.configuration?.pusherAppKey;
        const cluster = configQuery.state.data?.configuration?.pusherAppCluster;
        if (!passedClient && appKey && cluster) {
            setClient(new Pusher(appKey, { cluster }));
        }
    }, [configQuery.state.data?.configuration?.pusherAppKey, configQuery.state.data?.configuration?.pusherAppKey]);
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
