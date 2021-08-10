import { createClient, Client, fetchExchange } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import { devtoolsExchange } from '@urql/devtools';

export function getGQLClient(): Client {
    return createClient({
        url: 'https://graphql-dev.aiera.com/api/graphql',
        fetchOptions: {
            credentials: 'include',
        },
        exchanges: [devtoolsExchange, cacheExchange(), fetchExchange],
    });
}
