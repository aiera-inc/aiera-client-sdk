import React, { createContext, useContext, ReactNode, ReactElement } from 'react';

type Module = 'EventList';
type Platform = 'aiera-sdk-dev' | 'eze-eclipse' | 'glue42' | 'finsemble' | 'openfin';

export interface EnvConfig {
    apiUrl: string;
    assetPath: string;
    moduleName?: Module;
    platform?: Platform;
}

// Define this type just so it exists for typechecking.
// This will be injected by build.
const Env: { [key: string]: string } = {};

// Setup default values for env
// Leave these as Env.param instead of passing just Env,
// so that the build system can inject values.
const defaultConfig: EnvConfig = {
    apiUrl: Env.apiUrl || '',
    assetPath: Env.assetPath || 'assets/',
};

export const Context = createContext<EnvConfig>(defaultConfig);

/**
 * A React Provider to configure an app-level configuration
 */
export function Provider({ config, children }: { config: Partial<EnvConfig>; children: ReactNode }): ReactElement {
    return <Context.Provider value={{ ...defaultConfig, ...config }}>{children}</Context.Provider>;
}

export function useConfig(): EnvConfig {
    return useContext(Context);
}
