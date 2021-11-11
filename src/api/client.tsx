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
import React, { createContext, ReactElement, ReactNode, useContext, useMemo, useState } from 'react';
import {
    Client,
    createClient,
    useClient as useUrqlClient,
    fetchExchange,
    Exchange,
    makeOperation,
    Provider as UrqlProvider,
    useQuery as urqlUseQuery,
    CombinedError,
    UseQueryState,
    UseQueryResponse,
    UseQueryArgs,
} from 'urql';
import { pipe, map } from 'wonka';
import { devtoolsExchange } from '@urql/devtools';
import { DocumentNode } from 'graphql';

import { AuthConfig, authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';

import { useConfig } from '@aiera/client-sdk/lib/config';
import { defaultTokenAuthConfig } from '@aiera/client-sdk/api/auth';

/**
 * Function to extract the query names from a GQL document
 *
 * @param  doc - DocumentNode from parsed GQL query
 * @returns An array of operation names
 */
export function getQueryNames(doc: DocumentNode): string[] {
    return doc.definitions
        .map<string>((definition) => {
            const name = definition.kind === 'OperationDefinition' ? definition.name?.value : '';
            return name || '';
        })
        .filter((n) => n);
}

const opNameExchange: Exchange = ({ forward }) => {
    return (ops$) =>
        pipe(
            ops$,
            map((op) => {
                let url: string;
                try {
                    const parsedUrl = new window.URL(op.context.url);
                    const params = parsedUrl.searchParams;
                    params.set('ops', getQueryNames(op.query).join(','));
                    parsedUrl.search = params.toString();
                    url = parsedUrl.toString();
                } catch (e) {
                    url = op.context.url;
                }
                return makeOperation(op.kind, op, {
                    ...op.context,
                    url,
                });
            }),
            forward
        );
};

/**
 * @notExported
 */
interface Config {
    url: string;
    auth?: AuthConfig<unknown> | null;
    fetch?: typeof window.fetch;
}

function createGQLClient({ url, fetch, auth = defaultTokenAuthConfig }: Config): Client {
    const exchanges = [
        devtoolsExchange,
        opNameExchange,
        cacheExchange(),
        auth ? authExchange(auth) : null,
        fetchExchange,
    ].filter(
        (t) => t
        // Cast needed because of the filter
    ) as Exchange[];

    return createClient({
        url,
        fetch,
        exchanges,
    });
}

export type { Client };

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
    client: passedClient,
}: {
    config?: Partial<Config>;
    children: ReactNode;
    client?: Client;
}): ReactElement => {
    const envConfig = useConfig();
    const clientConfig = { ...config, url: config.url || envConfig.apiUrl };
    const [client, setClient] = useState(passedClient || createGQLClient(clientConfig));
    const reset = () => setClient(passedClient || createGQLClient(clientConfig));
    return (
        <Context.Provider value={{ reset }}>
            <UrqlProvider value={client}>{children}</UrqlProvider>
        </Context.Provider>
    );
};

export const useClient = (): ClientContext & { client: Client } => {
    const client = useUrqlClient();
    const { reset } = useContext(Context);
    return { client, reset };
};

/**
 * @ignore
 */
export const ResetProvider = Context.Provider;

export interface BaseQueryResult<Data, Variables> {
    state: UseQueryState<Data, Variables>;
    refetch: UseQueryResponse<Data, Variables>[1];
}

export interface LoadingQueryResult<Data, Variables> extends BaseQueryResult<Data, Variables> {
    status: 'loading';
}

export interface ErrorQueryResult<Data, Variables> extends BaseQueryResult<Data, Variables> {
    status: 'error';
    error: CombinedError;
}

export interface PausedQueryResult<Data, Variables> extends BaseQueryResult<Data, Variables> {
    status: 'paused';
}

export interface EmptyQueryResult<Data, Variables> extends BaseQueryResult<Data, Variables> {
    status: 'empty';
    data: Data;
}

export interface SuccessQueryResult<Data, Variables> extends BaseQueryResult<Data, Variables> {
    status: 'success';
    data: Data;
}

export interface QueryResultEmptyCheck<Data> {
    isEmpty?: (data: Data) => boolean;
}

export type QueryResult<Data, Variables> =
    | LoadingQueryResult<Data, Variables>
    | ErrorQueryResult<Data, Variables>
    | PausedQueryResult<Data, Variables>
    | EmptyQueryResult<Data, Variables>
    | SuccessQueryResult<Data, Variables>;

export function useQuery<Data, Variables>(
    args: UseQueryArgs<Variables, Data> & QueryResultEmptyCheck<Data>
): QueryResult<Data, Variables> {
    const { isEmpty } = args;
    const [state, refetch] = urqlUseQuery<Data, Variables>(args);
    return useMemo(() => {
        if (state.fetching) {
            return { status: 'loading', state, refetch };
        }

        if (state.error) {
            return { status: 'error', state, error: state.error, refetch };
        }

        if (args.pause) {
            return { status: 'paused', state, refetch };
        }

        if (isEmpty && state.data && isEmpty(state.data)) {
            return { status: 'empty', state, data: state.data, refetch };
        }

        return { status: 'success', state, data: state.data as Data, refetch };
    }, [state, refetch]);
}
