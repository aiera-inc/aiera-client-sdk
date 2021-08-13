module.exports = {
    schema: 'https://api-dev.aiera.com/graphql',
    documents: ['./src/**/*.tsx', './src/**/*.ts'],
    overwrite: true,
    generates: {
        './src/types/generated.ts': {
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
