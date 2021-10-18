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
        boxShadow: {
            DEFAULT: '0px 1px 2px rgba(184, 184, 208, 0.28), 0px 4px 8px rgba(131, 131, 165, 0.07)',
            '3xl': '0px 1px 2px rgba(184, 184, 208, 0.28), 0px 20px 28px rgba(131, 131, 165, 0.12)',
        },
        extend: {
            boxShadow: {
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
