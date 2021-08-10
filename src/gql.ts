import { createClient, Client } from 'urql';

export function getGQLClient(): Client {
    return createClient({
        url: 'https://graphql-dev.aiera.com/api/graphql',
        fetchOptions: {
            credentials: 'include',
        },
    });
}
