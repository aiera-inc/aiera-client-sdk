import minimatch from 'minimatch';
import { join } from 'path';
import { readFile } from 'fs/promises';
import copy from 'cpy';
import { build, BuildOptions, OnLoadResult, Plugin, serve } from 'esbuild';
import yargs from 'yargs/yargs';
import { globby } from 'globby';
import chokidar, { FSWatcher } from 'chokidar';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';

interface Watchers {
    src: FSWatcher;
    assets: FSWatcher;
    tailwind: FSWatcher;
}

const srcPath = join(process.cwd(), '/src');

function postcssPlugin(watcher: FSWatcher | null): Plugin {
    const cache = new Map<string, { css: string; result: OnLoadResult }>();
    return {
        name: 'postcss',
        setup: (build) => {
            const clearCache = () => {
                console.log('clearing cache');
                cache.clear();
            };
            if (watcher) {
                watcher.on('all', clearCache);
                build.onEnd(() => {
                    watcher.off('all', clearCache);
                });
            }

            build.onLoad({ filter: /\.css$/, namespace: 'file' }, async ({ path }) => {
                if (minimatch(path, `${srcPath}/**/*.css`)) {
                    const { plugins, options } = await postcssLoadConfig();
                    const css = await readFile(path, 'utf-8');
                    const prev = cache.get(path);
                    let contents = prev?.result?.contents;
                    if (!prev || prev.css !== css) {
                        const res = await postcss(plugins).process(css, {
                            ...options,
                            from: path,
                        });
                        contents = res.css;
                    }
                    const result: OnLoadResult = {
                        contents,
                        loader: 'css',
                    };
                    cache.set(path, { css, result });
                    return result;
                }
                return null;
            });
        },
    };
}

async function copyAssets(watchers: Watchers | null) {
    console.log('Copying assets to dist');
    if (watchers) {
        watchers.assets.on('all', () => void copyAssets(null));
    }
    return await Promise.all([
        copy('src/assets/**/*', 'dist/assets'),
        copy('package.json', 'dist'),
        watchers ? copy(['src/dev/*.html'], 'dist') : null,
    ]);
}

function toCamelCase(snakeCase: string): string {
    return snakeCase.toLowerCase().replace(/_[a-z]/g, (char) => `${char[1].toUpperCase()}`);
}

function getEnv(): { [key: string]: string } {
    return Object.fromEntries(
        Object.entries(process.env)
            .filter(([key]) => key.startsWith('AIERA_SDK_'))
            .map(([key, value]) => [`Env.${toCamelCase(key.replace('AIERA_SDK_', ''))}`, `"${value || ''}"`])
    );
}

const sharedConfig: BuildOptions = {
    sourcemap: 'external',
    target: 'es6',
    tsconfig: 'tsconfig.json',
    define: getEnv(),
};

async function buildAll(watchers: Watchers | null, plugins: Plugin[]) {
    console.time('Built in');
    const files = await globby('src/**/*.{ts,tsx,css}');
    const buildResult = await build({
        ...sharedConfig,
        entryPoints: files,
        outdir: 'dist',
        format: 'cjs',
        plugins,
    });

    if (watchers) {
        watchers.src.on('all', () => void buildAll(null, plugins));
        watchers.tailwind.on('all', () => void buildAll(null, plugins));
    }

    console.timeEnd('Built in');
    return buildResult;
}

async function serveAll(port: number, plugins: Plugin[]) {
    const serveResult = await serve(
        {
            port,
            servedir: 'src/dev',
            onRequest: ({ method, path, timeInMS }) => {
                console.log(`${method} ${path} ${timeInMS}ms`);
            },
        },
        {
            ...sharedConfig,
            entryPoints: ['src/dev/index.tsx'],
            bundle: true,
            outdir: 'src/dev/bundle',
            plugins,
            incremental: true,
            write: false,
            loader: {
                '.svg': 'file',
            },
        }
    );
    console.log(`Listening on ${serveResult.host}:${port}`);
    return serveResult;
}

interface Arguments {
    port: number;
    watch: boolean;
}

async function cli(args: Arguments) {
    if (args.watch) {
        const tailwindWatcher = chokidar.watch(['tailwind.config.js'], { ignoreInitial: true });
        const plugins: Plugin[] = [postcssPlugin(tailwindWatcher)];
        const watchers: Watchers = {
            src: chokidar.watch(['src/**/*.{ts,tsx,css}'], { ignoreInitial: true }),
            assets: chokidar.watch(['package.json', 'src/**/*.{html,svg,png}'], { ignoreInitial: true }),
            tailwind: tailwindWatcher,
        };
        await serveAll(args.port, plugins);
        await buildAll(watchers, plugins);
        await copyAssets(watchers);
    } else {
        const plugins: Plugin[] = [postcssPlugin(null)];
        await buildAll(null, plugins);
        await copyAssets(null);
    }
}

void cli(
    yargs(process.argv.slice(2)).options({
        port: { type: 'number', default: 8001 },
        watch: { type: 'boolean', default: false },
    }).argv
);
