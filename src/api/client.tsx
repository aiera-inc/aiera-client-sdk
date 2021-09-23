/**
 * To setup a GQL provider for your react app:
 *
 * ```typescript
 * import { Provider } from 'api/client';
 *
 * const App = () => (
 *     <Provider config={{url: 'https://your.graphql.url'}}>
 *         <App />
 *     </Provider>
 * );
 * ```
 * @module
 */
import React, { createContext, ReactElement, ReactNode, useContext, useState } from 'react';
import { Client, createClient, fetchExchange, Exchange, Provider as UrqlProvider } from 'urql';
import { devtoolsExchange } from '@urql/devtools';
import { AuthConfig, authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';

import { useConfig } from '@aiera/client-sdk/lib/config';
import { defaultTokenAuthConfig } from '@aiera/client-sdk/api/auth';

/**
 * @notExported
 */
interface Config {
    url: string;
    auth?: AuthConfig<unknown> | null;
    fetch?: typeof window.fetch;
}

function createGQLClient({ url, fetch, auth = defaultTokenAuthConfig }: Config): Client {
    const exchanges = [devtoolsExchange, cacheExchange(), auth ? authExchange(auth) : null, fetchExchange].filter(
        (t) => t
        // Cast needed because of the filter
    ) as Exchange[];

    return createClient({
        url,
        fetch,
        exchanges,
    });
}

/** @notExported */
interface ClientContext {
    reset: () => void;
}
const Context = createContext<ClientContext>({ reset: () => undefined });

/**
 * A React Provider to configure an app-level graphql client...
 */
export const Provider = ({
    config = {},
    children,
}: {
    config?: Partial<Config>;
    children: ReactNode;
}): ReactElement => {
    const appConfig = useConfig();
    const clientConfig = { ...config, url: config.url || appConfig.apiUrl };
    const [client, setClient] = useState(createGQLClient(clientConfig));
    const reset = () => setClient(createGQLClient(clientConfig));
    return (
        <Context.Provider value={{ reset }}>
            <UrqlProvider value={client}>{children}</UrqlProvider>
        </Context.Provider>
    );
};

export const useClient = (): ClientContext => useContext(Context);

/**
 * @ignore
 */
export const ResetProvider = Context.Provider;
