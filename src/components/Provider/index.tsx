import React, { ReactElement, ReactNode } from 'react';

import { Provider as ClientProvider, Client } from '@aiera/client-sdk/api/client';
import { Provider as MessageBusProvider, MessageBus } from '@aiera/client-sdk/lib/msg';
import { Provider as ConfigProvider, EnvConfig } from '@aiera/client-sdk/lib/config';
import { Provider as RealtimeProvider, Realtime } from '@aiera/client-sdk/lib/realtime';
import { Provider as StorageProvider, Storage } from '@aiera/client-sdk/lib/storage';

export type { Client, MessageBus, EnvConfig, Realtime, Storage };

/** @notExported */
export interface ProviderProps {
    bus?: MessageBus;
    children: ReactNode;
    client?: Client;
    config: EnvConfig;
    realtime?: Realtime;
    reset?: () => void;
    storage?: Storage;
}

/**
 * Renders Provider
 */
export function Provider(props: ProviderProps): ReactElement {
    const { bus, children, client, config, realtime, reset, storage } = props;
    return (
        <ConfigProvider config={config}>
            <ClientProvider client={client} reset={reset}>
                <MessageBusProvider bus={bus}>
                    <RealtimeProvider client={realtime}>
                        <StorageProvider storage={storage}>{children}</StorageProvider>
                    </RealtimeProvider>
                </MessageBusProvider>
            </ClientProvider>
        </ConfigProvider>
    );
}
