const themes = require('daisyui/src/theming/themes');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        container: {
            center: true,
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        // theme names are kept as 'dracula'/'light' because they're
        // persisted in localStorage ('privch_theme'), only the colors
        // are customized towards the Privch purple branding
        themes: [
            {
                dracula: {
                    ...themes['[data-theme=dracula]'],
                    primary: '#a970ff',
                    'base-100': '#1f2029',
                    'base-200': '#282a36',
                    'base-300': '#33364a',
                },
            },
            {
                light: {
                    ...themes['[data-theme=light]'],
                    primary: '#7c3aed',
                    secondary: '#9147ff',
                },
            },
        ],
    },
};
