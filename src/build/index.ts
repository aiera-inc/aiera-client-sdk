import minimatch from 'minimatch';
import { basename, join } from 'path';
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
        watchers ? copy(['src/dev/*.html'], 'dist') : null,
    ]);
}

function toCamelCase(snakeCase: string): string {
    return snakeCase.toLowerCase().replace(/_[a-z]/g, (char) => `${char[1]?.toUpperCase() || ''}`);
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

    const modules = await globby('src/dev/*.tsx');
    await Promise.all(
        modules.map(async (module) => {
            await build({
                ...sharedConfig,
                sourcemap: 'inline',
                entryPoints: [module],
                bundle: true,
                outfile: `dist/site/${basename(module, '.tsx')}/index.js`,
                format: 'cjs',
                plugins,
                loader: {
                    '.svg': 'file',
                },
            });

            await copy('src/dev/index.html', `dist/site/${basename(module, '.tsx')}`);
        })
    );

    if (watchers) {
        watchers.src.on('all', () => void buildAll(null, plugins));
        watchers.tailwind.on('all', () => void buildAll(null, plugins));
    }

    console.timeEnd('Built in');
    return buildResult;
}

async function serveAll(port: number, module: string, plugins: Plugin[]) {
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
            entryPoints: [`src/dev/${module}.tsx`],
            bundle: true,
            outfile: 'src/dev/index.js',
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
    module: string;
    port: number;
    watch: boolean;
}

async function cli() {
    const args: Arguments = await yargs(process.argv.slice(2)).options({
        module: { type: 'string', default: 'EventList' },
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
        await serveAll(args.port, args.module, plugins);
        await buildAll(watchers, plugins);
        await copyAssets(watchers);
    } else {
        const plugins: Plugin[] = [postcssPlugin()];
        await buildAll(null, plugins);
        await copyAssets(null);
    }
}

void cli();
