/* eslint-disable */
module.exports = {
    // The root of your source code, typically /src
    // `<rootDir>` is a token Jest substitutes
    roots: ['<rootDir>/../src'],

    // Jest transformations -- this adds support for TypeScript
    // using ts-jest
    transform: {
        '^.+\\.tsx?$': 'esbuild-jest',
    },

    // Test spec file resolution pattern
    // Matches parent folder `__tests__` and filename
    // should contain `test` or `spec`.
    testRegex: '.*test\\.tsx?$',

    // Module file extensions for importing
    moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
    modulePaths: ['<rootDir>/../src'],
    watchPathIgnorePatterns: ["<rootDir>/../build/dev/"],

    testEnvironment: 'jsdom',

    moduleNameMapper: {
        '\\.(scss|sass|css)$': '<rootDir>/style.mock.js',
    },
};
