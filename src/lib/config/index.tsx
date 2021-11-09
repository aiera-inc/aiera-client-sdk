import React, { createContext, useContext, ReactNode, ReactElement } from 'react';

type Module = 'EventList';
type Platform = 'aiera-sdk-dev' | 'eze-eclipse' | 'glue42' | 'finsemble' | 'openfin';

interface AppConfig {
    apiUrl: string;
    assetPath: string;
    moduleName?: Module;
    platform?: Platform;
}

// Setup default values for env
const Env: AppConfig = {
    apiUrl: '',
    assetPath: 'assets/',
};

// Leave these as Env.param instead of passing just Env,
// so that the build system can inject values.
export const Context = createContext<AppConfig>({
    apiUrl: Env.apiUrl,
    assetPath: Env.assetPath,
});

/**
 * A React Provider to configure an app-level configuration
 */
export function Provider({ config, children }: { config: Partial<AppConfig>; children: ReactNode }): ReactElement {
    return <Context.Provider value={{ ...Env, ...config }}>{children}</Context.Provider>;
}

export function useConfig(): AppConfig {
    return useContext(Context);
}
