const glob = require('fast-glob');

const ignore = ['src/dev', 'src/build', 'src/css', 'src/testUtils.tsx', '**/*test.{ts,tsx}', '**/styles.css'];
const entryPoints = [
    ...new Set([
        ...glob.sync(['src/modules/**/*'], {
            deep: 2,
            ignore,
        }),
        ...glob.sync(['src/components/**/*'], {
            deep: 2,
            ignore,
        }),
        ...glob.sync(['src/api/**/*'], {
            deep: 2,
            ignore,
        }),
        ...glob.sync(['src/lib/**/*'], {
            deep: 2,
            ignore,
        }),
        ...glob.sync(['src/**/*'], {
            deep: 2,
            ignore,
        }),
    ]),
];

module.exports = {
    name: '@aiera/client-sdk',
    sort: ['source-order'],
    readme: 'none',
    out: 'dist/docs',
    entryPoints: entryPoints,
};
