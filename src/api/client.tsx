/**
 * To set up a GQL provider for your React app:
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
import { devtoolsExchange } from '@urql/devtools';
import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { DocumentNode } from 'graphql';
import React, { createContext, ReactElement, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
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
import { useConfig, Config } from '@aiera/client-sdk/lib/config';
import { defaultTokenAuthConfig } from '@aiera/client-sdk/api/auth';
import { DeleteChatSessionMutation, DeleteChatSessionMutationVariables } from '@aiera/client-sdk/types/generated';

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
 * Creates a configured GraphQL client with proper cache normalization and resolvers
 */
export function createGQLClient(config: Config): Client {
    const { auth = defaultTokenAuthConfig } = config.gqlOptions?.exchangeOptions || {};

    // Enhanced cache exchange with more robust keys and resolvers
    const enhancedCacheExchange = cacheExchange({
        // Define keys for all types to ensure proper cache normalization
        keys: {
            // Application-specific types
            ApplicationConfiguration: () => null,
            Attachment: () => null,
            ChatSource: () => null,
            Citation: () => null,
            CitableContent: () => null,
            EventQuotePriceInfo: () => null,
            ListBlock: () => null,
            ListBlockMeta: () => null,
            OpenSearch: () => null,
            QuoteBlock: () => null,
            QuoteBlockMeta: () => null,
            RealtimeTranscrippetPrice: () => null,
            Search: () => null,
            TextBlock: () => null,
            TextBlockMeta: () => null,
            TranscrippetEquityPrice: () => null,
            UserEmailStatus: () => null,

            // Chat message types
            ChatMessage: ({ id }) => (id ? `ChatMessage:${id}` : null),
            ChatMessagePrompt: ({ id }) => (id ? `ChatMessagePrompt:${id}` : null),
            ChatMessageResponse: ({ id }) => (id ? `ChatMessageResponse:${id}` : null),
            ChatMessageSourceConfirmation: ({ id }) => (id ? `ChatMessageSourceConfirmation:${id}` : null),
            ChatSession: ({ id }) => (id ? `ChatSession:${id}` : null),
        },
        // Type conditions used in fragments
        typePolicies: {
            ChatMessagePrompt: { __typename: 'ChatMessagePrompt' },
            ChatMessageResponse: { __typename: 'ChatMessageResponse' },
            ChatMessageSourceConfirmation: { __typename: 'ChatMessageSourceConfirmation' },
            TextBlock: { __typename: 'TextBlock' },
            ListBlock: { __typename: 'ListBlock' },
            ImageBlock: { __typename: 'ImageBlock' },
            QuoteBlock: { __typename: 'QuoteBlock' },
            TableBlock: { __typename: 'TableBlock' },
            ChartBlock: { __typename: 'ChartBlock' },
            ContentBlock: { __typename: true }, // Mark as interface
        },
        // Add update policies for mutations
        updates: {
            Mutation: {
                deleteChatSession: (
                    result: DeleteChatSessionMutation,
                    args: DeleteChatSessionMutationVariables,
                    cache
                ) => {
                    if (result.deleteChatSession?.success) {
                        cache.invalidate({ __typename: 'ChatSession', id: args.input.sessionId });
                    }
                },
            },
        },
    });

    const exchanges = [
        devtoolsExchange,
        opNameExchange,
        enhancedCacheExchange,
        auth ? authExchange(auth) : null,
        fetchExchange,
    ].filter((t) => t) as Exchange[];

    const fetchOptions: RequestInit = {};
    if (config.moduleName) {
        fetchOptions.headers = { Component: config.moduleName };
    }

    return createClient({
        ...(config.gqlOptions?.clientOptions || { url: '' }),
        exchanges,
        fetchOptions,
        requestPolicy: 'cache-and-network',
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
    children,
    client: passedClient,
    reset: passedReset,
}: {
    children: ReactNode;
    client?: Client;
    reset?: () => void;
}): ReactElement => {
    const Config = useConfig();
    const [client, setClient] = useState(passedClient || createGQLClient(Config));
    const reset = passedReset || (() => setClient(passedClient || createGQLClient(Config)));
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
    isRefetching: boolean;
    isPaging: boolean;
}

export interface QueryResultEmptyCheck<Data> {
    isEmpty?: (data: Data) => boolean;
}

export type QueryResult<Data, Variables = undefined> =
    | LoadingQueryResult<Data, Variables>
    | ErrorQueryResult<Data, Variables>
    | PausedQueryResult<Data, Variables>
    | EmptyQueryResult<Data, Variables>
    | SuccessQueryResult<Data, Variables>;

export interface PagingQueryArgs<Variables, Data> extends UseQueryArgs<Variables, Data> {
    mergeResults: (prevResults: Data, newResults: Data) => Data;
    variables: Variables & {
        fromIndex: number;
        size?: number;
    };
}

export function useQuery<Data, Variables = undefined>(
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

        return {
            status: 'success',
            state,
            data: state.data as Data,
            refetch,
            isRefetching: state.stale,
            isPaging: false,
        };
    }, [state, refetch]);
}

export function usePagingQuery<Data, Variables>(
    args: PagingQueryArgs<Variables, Data> & QueryResultEmptyCheck<Data>
): QueryResult<Data, Variables> {
    const { mergeResults, variables } = args;
    const queryResult: QueryResult<Data, Variables> = useQuery<Data, Variables>(args);

    const [fromIndex, setFromIndex] = useState<number>(0);
    // Map of the query results where fromIndex is the key
    const [results, setResults] = useState<{ [key: number]: Data } | undefined>(undefined);

    const data = useMemo(() => {
        let data = undefined;
        // Return data when the query finishes or while paginating
        if (
            queryResult.state.data &&
            (queryResult.status === 'success' || (queryResult.status === 'loading' && variables.fromIndex > 0))
        ) {
            data = results
                ? mergeResults(
                      Object.values(results).reduce((res, r) => mergeResults(res, r), {} as Data),
                      queryResult.state.data
                  )
                : queryResult.state.data;
        }
        return data;
    }, [queryResult.state.data, queryResult.status, results, variables.fromIndex]);

    useEffect(() => {
        // Set fromIndex in state when the query variable changes
        if (fromIndex !== variables.fromIndex) {
            setFromIndex(variables.fromIndex);
        }
        // If the user is already paging and the fromIndex query variable is changed back to 0,
        // then reset fromIndex and results in state
        if (fromIndex > 0 && variables.fromIndex === 0) {
            setResults(undefined);
        } else if (queryResult.state.data) {
            setResults({
                ...results,
                [variables.fromIndex]: queryResult.state.data,
            });
        }
    }, [fromIndex, queryResult.state.data, variables.fromIndex]);

    return useMemo(() => {
        if (queryResult.status === 'loading' && variables.fromIndex > 0 && data) {
            return { ...queryResult, data, status: 'success', isPaging: true, isRefetching: false };
        }
        if (queryResult.status === 'success') {
            return { ...queryResult, data: data as Data };
        }
        return queryResult;
    }, [data, queryResult, variables.fromIndex]);
}
