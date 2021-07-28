/* eslint  @typescript-eslint/unbound-method: 0 */
// import path from 'path';
import ts from 'typescript';
import { build } from 'esbuild';
import copy from 'cpy';
import yargs from 'yargs/yargs';
import chokidar from 'chokidar';

const cwd = process.cwd();

interface Config {
    filePath: ReturnType<typeof ts.findConfigFile>;
    file: ReturnType<typeof ts.readConfigFile>;
    contents: ReturnType<typeof ts.parseJsonConfigFileContent>;
}

function getConfig(): Config {
    const filePath = ts.findConfigFile(cwd, ts.sys.fileExists);
    if (!filePath) {
        throw new Error('Unable to find tsconfig.json');
    }
    const file = ts.readConfigFile(filePath, ts.sys.readFile);
    const contents = ts.parseJsonConfigFileContent(file.config, ts.sys, cwd);
    return { filePath, file, contents };
}

async function buildJs(config: Config) {
    return await build({
        outdir: config.contents.options.outDir || 'build',
        entryPoints: config.contents.fileNames,
        sourcemap: config.contents.options.inlineSourceMap ? 'inline' : config.contents.options.sourceMap,
        // eslint-disable-next-line
        target: config.contents.raw?.compilerOptions?.target || 'es6',
        tsconfig: config.filePath,
        bundle: false,
        format: 'cjs',
    });
}

async function copyAssets() {
    return await copy(['**/*.html', '!**/*.{ts,tsx,js,jsx,css}'], '../build', { cwd: 'src', parents: true });
}

async function buildAll() {
    console.time('Built in');
    await Promise.all([buildJs(getConfig()), copyAssets()]);
    console.timeEnd('Built in');
}

interface Arguments {
    watch: boolean;
}

async function cli(args: Arguments) {
    if (args.watch) {
        void buildAll();
        chokidar.watch('src/**/*', { ignoreInitial: true }).on('all', () => {
            void buildAll();
        });
    } else {
        await buildAll();
    }
}

void cli(
    yargs(process.argv.slice(2)).options({
        watch: { type: 'boolean', default: false },
    }).argv
);
