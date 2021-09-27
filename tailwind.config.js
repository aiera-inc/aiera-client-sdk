module.exports = {
    purge: ['./src/**/*.html', './src/**/*.css', './src/**/*.ts*'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            boxShadow: {
                header: '0px 1px 2px rgba(0, 0, 0, 0.07), 0px 12px 24px rgba(0, 0, 0, 0.03)',
            },
        },
    },
    variants: {
        extend: {
            backgroundColor: ['odd', 'active'],
            fill: ['hover', 'active', 'group-active'],
            margin: ['first', 'last'],
            textColor: ['hover', 'active', 'group-active'],
        },
    },
    plugins: [require('@tailwindcss/line-clamp'), require('tailwindcss-interaction-variants')],
};
