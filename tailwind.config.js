/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./templates/**/**.eta'],
    plugins: [require('daisyui')],
    daisyui: {
        themes: ['dracula'],
    },
};
