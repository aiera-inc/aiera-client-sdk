/* eslint-disable */
const path = require('path');
module.exports = {
    // The root of your source code, typically /src
    // `<rootDir>` is a token Jest substitutes
    roots: ['<rootDir>/../src'],

    transform: { '^.+\\.[jt]sx?$': ['babel-jest', { configFile: path.resolve(__dirname, 'babel.config.js') }] },

    // Test spec file resolution pattern
    // Matches parent folder `__tests__` and filename
    // should contain `test` or `spec`.
    testRegex: '.*test\\.tsx?$',

    // Module file extensions for importing
    moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
    modulePaths: ['<rootDir>/../src'],
    watchPathIgnorePatterns: ['<rootDir>/../dist/', '<rootDir>/../src/dev/'],

    testEnvironment: 'jsdom',

    moduleNameMapper: {
        '\\.(scss|sass|css)$': '<rootDir>/style.mock.js',
        '\\.(svg|png)$': '<rootDir>/img.mock.js',
        '@aiera/client-sdk/(.*)': '<rootDir>/../src/$1',
    },

    setupFilesAfterEnv: ['<rootDir>/jest-setup.js']
};
