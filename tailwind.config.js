module.exports = {
    mode: 'jit',
    content: ['./src/**/*.html', './src/**/*.css', './src/**/*.ts*'],
    darkMode: 'class', // or 'media' or 'class'
    theme: {
        fontSize: {
            xxs: '.5rem',
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
                DEFAULT: '0px 1px 2px rgba(184, 184, 208, 0.28), 0px 4px 8px rgba(131, 131, 165, 0.07)',
                '3xl': '0px 1px 2px rgba(184, 184, 208, 0.28), 0px 20px 28px rgba(131, 131, 165, 0.12)',
                input: 'inset 0 0px 0px 1px #2463eb',
                '3xl-dark': '0px 1px 2px rgba(0, 0, 0, 0.18), 0px 12px 24px rgba(0, 0, 0, 0.13)',
            },
            colors: {
                bluegray: {
                    1: '#647DA1',
                    2: '#576F93',
                    3: '#3D5271',
                    4: '#D0CDE4',
                    5: '#42425A',
                    6: '#38384C',
                    7: '#242434',
                },
            },
            cursor: {
                grab: 'grab',
                grabbing: 'grabbing',
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
            opacity: ['disabled'],
            padding: ['first', 'last'],
            textColor: ['hover', 'active', 'group-active', 'group-focus-within'],
        },
    },
    plugins: [require('@tailwindcss/line-clamp'), require('tailwindcss-interaction-variants')],
};
