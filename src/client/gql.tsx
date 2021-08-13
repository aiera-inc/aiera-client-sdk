import React, { createContext, FC, ReactElement, ReactNode, useContext, useState } from 'react';
import { Client, createClient, fetchExchange, Provider as UrqlProvider } from 'urql';
import { devtoolsExchange } from '@urql/devtools';
import { AuthConfig, authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';

import { defaultAuthConfig } from 'client/auth';

interface Config {
    url: string;
    auth?: AuthConfig<unknown>;
}

function createGQLClient(config: Config): Client {
    return createClient({
        url: config.url,
        exchanges: [devtoolsExchange, cacheExchange(), authExchange(config.auth || defaultAuthConfig), fetchExchange],
    });
}

interface ClientContext {
    reset: () => void;
}
const Context = createContext<ClientContext>({ reset: () => undefined });

interface Props {
    config: Config;
    children: ReactNode;
}
export const Provider: FC<Props> = ({ config, children }: Props): ReactElement => {
    const [client, setClient] = useState(createGQLClient(config));
    const reset = () => setClient(createGQLClient(config));
    return (
        <Context.Provider value={{ reset }}>
            <UrqlProvider value={client}>{children}</UrqlProvider>
        </Context.Provider>
    );
};

export const useClient = (): ClientContext => useContext(Context);
