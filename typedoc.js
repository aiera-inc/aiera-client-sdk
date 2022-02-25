const glob = require('fast-glob');

const ignore = [
    'src/dev',
    'src/build',
    'src/css',
    'src/components/Svg',
    'src/testUtils.tsx',
    'src/types/svg.d.ts',
    '**/*test.{ts,tsx}',
    '**/styles.css',
];
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
            deep: 3,
            ignore,
        }),
        ...glob.sync(['src/web/**/*'], {
            deep: 2,
            ignore,
        }),
        ...glob.sync(['src/**/*'], {
            deep: 2,
            ignore,
        }),
        ...glob.sync(['src/web/embed.ts'], {
            deep: 2,
            ignore,
        }),
    ]),
];

module.exports = {
    name: '@aiera/client-sdk',
    sort: ['source-order'],
    readme: 'none',
    out: 'dist/web/docs',
    entryPoints: entryPoints,
};
