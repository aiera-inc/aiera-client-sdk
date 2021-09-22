import fs from 'fs';
import { NodePlopAPI } from 'node-plop';

export default (plop: NodePlopAPI) => {
    plop.setGenerator('component', {
        description: 'Create a new component or module',
        prompts: [
            {
                type: 'list',
                name: 'type',
                choices: ['component', 'module'],
                message: 'What type of component: ',
            },
            {
                type: 'input',
                name: 'name',
                message: 'Enter component/module name: ',
            },
        ],
        actions: [
            {
                type: 'addMany',
                destination: '../src/{{type}}s/{{name}}',
                templateFiles: '{{type}}/*.hbs',
            },
            // {
            //     type: 'append',
            //     template: "export { {{name}} } from './{{name}}';",
            //     path: '../src/{{type}}s/index.ts',
            // },
        ],
    });

    plop.setGenerator('nested', {
        description: 'Create a nested component for use in a single parent component or modules',
        prompts: [
            {
                type: 'list',
                name: 'type',
                choices: ['component', 'module'],
                message: 'What type of component: ',
            },
            {
                type: 'list',
                name: 'under',
                choices: (answers) => {
                    return fs
                        .readdirSync(`./src/${answers.type}s`, { withFileTypes: true })
                        .map((dir) => (dir.isDirectory() ? dir.name : ''))
                        .filter((f) => f);
                },
                message: 'Nest under: ',
            },
            {
                type: 'input',
                name: 'name',
                message: 'Enter nested component name: ',
            },
        ],
        actions: [
            {
                type: 'addMany',
                destination: '../src/{{type}}s/{{under}}/{{name}}',
                templateFiles: '{{type}}/*.hbs',
            },
        ],
    });

    plop.setGenerator('svg', {
        description: 'Create a new SVG component',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Enter SVG name: ',
            },
        ],
        actions: [
            {
                type: 'add',
                path: '../src/components/Svg/{{name}}.tsx',
                templateFile: 'svg.tsx.hbs',
            }
        ],
    });
};
