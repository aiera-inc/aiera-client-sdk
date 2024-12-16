import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactElement,
    ReactNode,
} from 'react';
import merge from 'lodash.merge';
import { ClientOptions } from 'urql';
import { AuthConfig } from '@urql/exchange-auth';
import { Options as RealtimeOptions } from 'pusher-js';
import { defaultEnv } from '@aiera/client-sdk/lib/config/env';
import { useMessageListener } from '../msg';

type Module =
    | 'Aieracast'
    | 'AieraChat'
    | 'ASR'
    | 'EventList'
    | 'NewsList'
    | 'EventByTicker'
    | 'EventListByTicker'
    | 'Transcrippet';
type Platform = 'aiera-sdk-dev' | 'embedded' | 'eze-eclipse' | 'glue42' | 'finsemble' | 'openfin';

export type EventListFilterType = 'earningsOnly' | 'transcripts';
export type EventListView = 'combined' | 'tabs';

export interface EventListFilter {
    name: EventListFilterType;
    defaultValue?: boolean;
    visible?: boolean;
}

export interface Options {
    customOnly?: boolean;
    darkMode?: boolean;
    eventId?: string;
    eventListFilters?: EventListFilter[];
    eventListView?: EventListView;
    initialItemId?: string;
    relativeTimestamps?: boolean;
    transcriptRawBeginSeconds?: number;
    transcriptRawEndSeconds?: number;
    transcriptRelativeBeginSeconds?: number;
    transcriptRelativeEndSeconds?: number;
    transcrippetGuid?: string;
    showAudioPlayer?: boolean;
    showCompanyFilter?: boolean;
    showCompanyNameInEventRow?: boolean;
    showDownloadButton?: boolean;
    showExport?: boolean;
    showGlobalSearch?: boolean;
    showPriceReaction?: boolean;
    showRecordingDetails?: boolean;
    showScheduleRecording?: boolean;
    showSearch?: boolean;
    showPartials?: boolean;
    showSentiment?: boolean;
    showSummary?: boolean;
    showTitleInfo?: boolean;
    ticker?: string;
}

export interface Overrides {
    style?: string;
}

export interface Tracking {
    userId?: string;
}

export interface User {
    email?: string;
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
    options?: Options;
    overrides?: Overrides;
    user?: User;
    tracking?: Tracking;
    virtualListKey?: string;
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
    virtualListKey: defaultEnv.virtualListKey,
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
    const bus = useMessageListener('configure', ({ data }) => setConfig(data), 'in');

    // Notify when the config is updated
    useEffect(() => {
        bus.emit('configured', null, 'out');
    }, [stateConfig]);

    return <Context.Provider value={stateConfig}>{children}</Context.Provider>;
}

export function useConfig(): Config {
    return useContext(Context);
}
