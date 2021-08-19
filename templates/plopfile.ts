import { NodePlopAPI } from 'node-plop';

export default (plop: NodePlopAPI) => {
    plop.setGenerator('component', {
        description: 'Create a new shared component',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Enter component name: ',
            },
        ],
        actions: [
            {
                type: 'addMany',
                destination: '../src/components/{{name}}',
                templateFiles: 'component/*.hbs',
            },
            {
                type: 'append',
                template: "export { {{name}} } from './{{name}}';",
                path: '../src/components/index.ts',
            },
        ],
    });

    plop.setGenerator('module', {
        description: 'Create a new module',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Enter module name: ',
            },
        ],
        actions: [
            {
                type: 'addMany',
                destination: '../src/module/{{name}}',
                templateFiles: 'module/*.hbs',
            },
            {
                type: 'append',
                template: "export { {{name}} } from './{{name}}';",
                path: '../src/modules/index.ts',
            },
        ],
    });
};
