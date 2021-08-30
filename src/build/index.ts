import minimatch from 'minimatch';
import { join } from 'path';
import { copyFile, readFile } from 'fs/promises';
import http, { IncomingMessage, ServerResponse } from 'http';
import { build, BuildOptions, OnLoadResult, Plugin, serve } from 'esbuild';
import yargs from 'yargs/yargs';
import { globby } from 'globby';
import chokidar, { FSWatcher } from 'chokidar';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';

const srcWatchPattern = 'src/**/*.{ts,tsx,css}';
const ignorePatterns = ['src/dev/docs'];
const srcPath = join(process.cwd(), '/src');

interface Watchers {
    pkg: FSWatcher;
    src: FSWatcher;
}

function postcssPlugin(): Plugin {
    const cache = new Map<string, { css: string; result: OnLoadResult }>();
    return {
        name: 'postcss',
        setup: (build) => {
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

async function copyFiles() {
    console.log('Copying assets to dist');
    return copyFile('package.json', 'dist/package.json');
}

const sharedConfig: BuildOptions = {
    sourcemap: 'external',
    target: 'es6',
    tsconfig: 'tsconfig.json',
};

async function buildAll(watchers: Watchers | null, plugins: Plugin[]) {
    console.time('Built in');
    const files = await globby(srcWatchPattern, { ignore: ignorePatterns });
    const buildResult = await build({
        ...sharedConfig,
        entryPoints: files,
        outdir: 'dist',
        format: 'cjs',
        plugins,
    });

    if (watchers) {
        Object.values(watchers).forEach((watcher: FSWatcher) => {
            watcher.on('all', () => void buildAll(null, plugins));
        });
    }

    await copyFiles();
    console.timeEnd('Built in');
    return buildResult;
}

function reloadProxy(port: number, watcher: FSWatcher) {
    return http.createServer((req: IncomingMessage, res: ServerResponse) => {
        if (req.url === '/watch') {
            const onChange = () => res.end();
            watcher.once('all', onChange);
            res.on('close', () => watcher.off('all', onChange));
        } else {
            req.pipe(
                http.request({ port, path: req.url, method: req.method, headers: req.headers }, (proxyRes) => {
                    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                    proxyRes.pipe(res, { end: true });
                }),
                { end: true }
            );
        }
    });
}

async function serveAll(port: number, watchers: Watchers, plugins: Plugin[]) {
    const serveResult = await serve(
        {
            port: port + 1,
            servedir: 'src/dev',
            onRequest: ({ method, path, timeInMS }) => {
                console.log(`${method} ${path} ${timeInMS}ms`);
            },
        },
        {
            ...sharedConfig,
            entryPoints: ['src/dev/index.tsx'],
            bundle: true,
            outdir: 'src/dev',
            plugins,
            incremental: true,
            write: false,
        }
    );
    const proxy = reloadProxy(port + 1, watchers.src);
    proxy.listen(port);
    console.log(`Listening on ${serveResult.host}:${port}`);
    return serveResult;
}

interface Arguments {
    port: number;
    watch: boolean;
}

async function cli(args: Arguments) {
    const plugins: Plugin[] = [postcssPlugin()];
    if (args.watch) {
        const watchers: Watchers = {
            pkg: chokidar.watch('package.json'),
            src: chokidar.watch(srcWatchPattern, { ignoreInitial: true, ignored: ignorePatterns }),
        };
        await serveAll(args.port, watchers, plugins);
        await buildAll(watchers, plugins);
    } else {
        await buildAll(null, plugins);
    }
}

void cli(
    yargs(process.argv.slice(2)).options({
        port: { type: 'number', default: 8000 },
        watch: { type: 'boolean', default: false },
    }).argv
);
