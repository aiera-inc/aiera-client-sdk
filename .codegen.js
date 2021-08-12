module.exports = {
    schema: 'https://graphql-dev.aiera.com/api/graphql',
    documents: ['./src/**/*.tsx', './src/**/*.ts'],
    overwrite: true,
    generates: {
        './src/types/graphql.ts': {
            plugins: [
                { add: { content: '/* eslint-disable @typescript-eslint/no-explicit-any */' } },
                'typescript',
                'typescript-operations',
                'typescript-urql',
            ],
            config: {
                skipTypename: false,
                withHooks: false,
                withHOC: false,
                withComponent: false,
            },
        },
    },
};
