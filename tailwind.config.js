module.exports = {
    purge: ['./src/**/*.html', './src/**/*.css', './src/**/*.ts*'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
    },
    variants: {
        extend: {
            margin: ['first', 'last']
        },
    },
    plugins: [],
};
