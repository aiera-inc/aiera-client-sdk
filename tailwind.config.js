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
                header: '0px 1px 2px rgba(0, 0, 0, 0.08), 0px 12px 24px -18px rgba(0, 0, 0, 0.2)',
                input: 'inset 0 0px 0px 1px #2463eb',
            },
        },
    },
    variants: {
        extend: {
            boxShadow: ['hover', 'active', 'focus', 'focus-within'],
            backgroundColor: ['odd', 'active'],
            border: ['focus', 'focus-within', 'hover', 'active'],
            ringColor: ['focus', 'focus-within', 'hover', 'active'],
            fill: ['hover', 'active', 'group-active', 'group-focus-within'],
            stroke: ['hover', 'active', 'group-active', 'group-focus-within'],
            margin: ['first', 'last'],
            textColor: ['hover', 'active', 'group-active', 'group-focus-within'],
        },
    },
    plugins: [require('@tailwindcss/line-clamp'), require('tailwindcss-interaction-variants')],
};
