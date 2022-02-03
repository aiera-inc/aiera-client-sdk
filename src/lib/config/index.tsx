import React, { createContext, useContext, useMemo, ReactNode, ReactElement } from 'react';
import merge from 'lodash.merge';
import { ClientOptions } from 'urql';
import { AuthConfig } from '@urql/exchange-auth';
import { Options as RealtimeOptions } from 'pusher-js';

type Module = 'EventList' | 'NewsList' | 'RecordingForm' | 'RecordingList';
type Platform = 'aiera-sdk-dev' | 'eze-eclipse' | 'glue42' | 'finsemble' | 'openfin';

export interface EnvConfig {
    assetPath: string;
    moduleName?: Module;
    platform?: Platform;
    gqlOptions: {
        clientOptions: ClientOptions;
        exchangeOptions?: {
            auth?: AuthConfig<unknown> | null;
        };
    };
    realtimeOptions?: RealtimeOptions;
}

// Define this type just so it exists for typechecking.
// This will be injected by build.
const Env: { [key: string]: string } = {};

// Setup default values for env
// Leave these as Env.param instead of passing just Env,
// so that the build system can inject values.
const defaultConfig: EnvConfig = {
    assetPath: Env.assetPath || 'assets/',
    gqlOptions: {
        clientOptions: { url: Env.apiUrl || '' },
    },
};

export const Context = createContext<EnvConfig>(defaultConfig);

/**
 * A React Provider to configure an app-level configuration
 */
export function Provider({ config, children }: { config: Partial<EnvConfig>; children: ReactNode }): ReactElement {
    return (
        <Context.Provider value={useMemo(() => merge(defaultConfig, config), [defaultConfig, config])}>
            {children}
        </Context.Provider>
    );
}

export function useConfig(): EnvConfig {
    return useContext(Context);
}
