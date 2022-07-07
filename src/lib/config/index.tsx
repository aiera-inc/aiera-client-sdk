import React, { createContext, useContext, useMemo, ReactNode, ReactElement, useState, useCallback } from 'react';
import merge from 'lodash.merge';
import { ClientOptions } from 'urql';
import { AuthConfig } from '@urql/exchange-auth';
import { Options as RealtimeOptions } from 'pusher-js';
import { defaultEnv } from '@aiera/client-sdk/lib/config/env';
import { useMessageListener } from '../msg';

type Module = 'ASR' | 'EventList' | 'NewsList' | 'RecordingList';
type Platform = 'aiera-sdk-dev' | 'embedded' | 'eze-eclipse' | 'glue42' | 'finsemble' | 'openfin';

interface ASROptions {
    eventId: string;
    darkMode?: boolean;
    showTitleInfo?: boolean;
    showRecordingDetails?: boolean;
    showPriceReaction?: boolean;
    showSearch?: boolean;
    showAudioPlayer?: boolean;
}

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
    hideSettings?: boolean;
    openDash?: () => void;
    asrOptions?: ASROptions;
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
};

export const Context = createContext<Config>(defaultConfig);

/**
 * A React Provider to configure an app-level configuration
 */
export function Provider({ config, children }: { config: Config; children: ReactNode }): ReactElement {
    const baseConfig = useMemo(() => merge(defaultConfig, config), [defaultConfig, config]);
    const [stateConfig, setStateConfig] = useState<Config>(baseConfig);
    const setConfig = useCallback(
        (newConfig: Config) => {
            setStateConfig({
                ...baseConfig,
                ...newConfig,
            });
        },
        [baseConfig, setStateConfig]
    );
    useMessageListener('configure', ({ data }) => setConfig(data), 'in');
    return <Context.Provider value={stateConfig}>{children}</Context.Provider>;
}

export function useConfig(): Config {
    return useContext(Context);
}
