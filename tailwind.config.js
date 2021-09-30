module.exports = {
    mode: 'jit',
    purge: ['./src/**/*.html', './src/**/*.css', './src/**/*.ts*'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        fontSize: {
            xs: '.625rem',
            sm: '.75rem',
            base: '.875rem',
            lg: '1rem',
            xl: '1.125rem',
            '2xl': '1.25rem',
            '3xl': '1.5rem',
            '4xl': '1.875rem',
            '5xl': '2.25rem',
            '6xl': '3rem',
            '7xl': '4rem',
        },
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
