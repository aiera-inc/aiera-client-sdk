import minimatch from 'minimatch';
import { basename, dirname, join } from 'path';
import { readFile } from 'fs/promises';
import copy from 'cpy';
import { build, BuildOptions, OnLoadResult, Plugin, serve } from 'esbuild';
import yargs from 'yargs/yargs';
import { globby } from 'globby';
import chokidar, { FSWatcher } from 'chokidar';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import './env';
import { defaultEnv } from '../lib/config/env';

interface Watchers {
    src: FSWatcher;
    assets: FSWatcher;
    tailwind: FSWatcher;
}

const srcPath = join(process.cwd(), '/src');

function postcssPlugin(): Plugin {
    return {
        name: 'postcss',
        setup: (build) => {
            build.onLoad({ filter: /\.css$/, namespace: 'file' }, async ({ path }) => {
                if (minimatch(path, `${srcPath}/**/*.css`)) {
                    const { plugins, options } = await postcssLoadConfig();
                    const css = await readFile(path, 'utf-8');
                    const res = await postcss(plugins).process(css, {
                        ...options,
                        from: path,
                    });
                    const result: OnLoadResult = {
                        contents: res.css,
                        loader: 'css',
                    };
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
        copy(['src/web/demo/*.html'], 'dist/web/demo'),
        copy(['src/web/mobile/*.html'], 'dist/web/mobile'),
    ]);
}

function toSnakeCase(camelCase: string): string {
    return camelCase.replace(/[a-z][A-Z]/g, (match) => `${match[0] || ''}_${match[1] || ''}`).toUpperCase();
}

function getEnv(): { [key: string]: string } {
    return Object.fromEntries(
        Object.entries(defaultEnv).map(([key, value]) => {
            const envKey = `AIERA_SDK_${toSnakeCase(key)}`;
            return [`process.env.${envKey}`, `"${process.env[envKey] || value}"`];
        })
    );
}

const sharedConfig: BuildOptions = {
    sourcemap: true,
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

    const modulePaths = await globby('src/web/modules/**/index.tsx');
    await Promise.all(
        modulePaths.map(async (modulePath) => {
            const moduleName = basename(dirname(modulePath));
            await build({
                ...sharedConfig,
                sourcemap: true,
                entryPoints: [modulePath],
                bundle: true,
                outfile: `dist/web/modules/${moduleName}/index.js`,
                format: 'cjs',
                plugins,
                loader: {
                    '.svg': 'file',
                },
            });
            await copy(`src/web/modules/${moduleName}/*.html`, `dist/web/modules/${moduleName}`);
        })
    );

    await build({
        ...sharedConfig,
        entryPoints: ['src/web/embed.ts'],
        sourcemap: true,
        bundle: true,
        outfile: `dist/web/embed.js`,
    });

    if (watchers) {
        watchers.src.on('all', () => void buildAll(null, plugins));
        watchers.tailwind.on('all', () => void buildAll(null, plugins));
    }

    console.timeEnd('Built in');
    return buildResult;
}

async function serveAll(port: number, plugins: Plugin[]) {
    const modules = await globby('src/web/modules/**/index.tsx');
    const serveResult = await serve(
        {
            port,
            servedir: 'src/web',
            onRequest: ({ method, path, timeInMS }) => {
                console.log(`${method} ${path} ${timeInMS}ms`);
            },
        },
        {
            ...sharedConfig,
            entryPoints: [...modules, 'src/web/embed.ts'],
            bundle: true,
            outdir: 'src/web',
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

async function cli() {
    const args: Arguments = await yargs(process.argv.slice(2)).options({
        port: { type: 'number', default: 8001 },
        watch: { type: 'boolean', default: false },
    }).argv;

    if (args.watch) {
        const tailwindWatcher = chokidar.watch(['tailwind.config.js'], { ignoreInitial: true });
        const plugins: Plugin[] = [postcssPlugin()];
        const watchers: Watchers = {
            src: chokidar.watch(['src/**/*.{ts,tsx,css}'], { ignoreInitial: true }),
            assets: chokidar.watch(['package.json', 'src/**/*.{html,svg,png}'], { ignoreInitial: true }),
            tailwind: tailwindWatcher,
        };
        await serveAll(args.port, plugins);
        await buildAll(watchers, plugins);
        await copyAssets(watchers);
    } else {
        const plugins: Plugin[] = [postcssPlugin()];
        await buildAll(null, plugins);
        await copyAssets(null);
    }
}

void cli();
