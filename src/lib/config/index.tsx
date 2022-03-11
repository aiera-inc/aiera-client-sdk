import React, { createContext, useContext, useMemo, ReactNode, ReactElement } from 'react';
import merge from 'lodash.merge';
import { ClientOptions } from 'urql';
import { AuthConfig } from '@urql/exchange-auth';
import { Options as RealtimeOptions } from 'pusher-js';
import { defaultEnv } from '@aiera/client-sdk/lib/config/env';

type Module = 'EventList' | 'NewsList' | 'RecordingList';
type Platform = 'aiera-sdk-dev' | 'embedded' | 'eze-eclipse' | 'glue42' | 'finsemble' | 'openfin';

export interface Config {
    assetPath?: string;
    moduleName?: Module;
    platform?: Platform;
    gqlOptions?: {
        clientOptions: ClientOptions;
        exchangeOptions?: {
            auth?: AuthConfig<unknown> | null;
        };
    };
    realtimeOptions?: RealtimeOptions;
    showDashButton?: boolean;
}

// Setup default values for env
// Leave these as Env.param instead of passing just Env,
// so that the build system can inject values.
const defaultConfig: Config = {
    assetPath: defaultEnv.assetPath,
    platform: defaultEnv.platform as Platform,
    gqlOptions: {
        clientOptions: { url: defaultEnv.apiUrl },
    },
    showDashButton: true,
};

export const Context = createContext<Config>(defaultConfig);

/**
 * A React Provider to configure an app-level configuration
 */
export function Provider({ config, children }: { config: Config; children: ReactNode }): ReactElement {
    return (
        <Context.Provider value={useMemo(() => merge(defaultConfig, config), [defaultConfig, config])}>
            {children}
        </Context.Provider>
    );
}

export function useConfig(): Config {
    return useContext(Context);
}
