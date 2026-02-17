/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  theme: {
    screens: {
      'peq': '260px',

      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'mlg': '1100px',

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }

    },
    extend: {
      colors: {
        coomeva_color: {
          rojo: '#D62429',
          grisClaroBordes: '#43425D',
          azulOscuro: '#4e6170',
          grisPestaña: '#707070',
          // grisPestaña2: '#E8EAEA',
          grisPestaña2:'#58585a1a',
          azulClaro: '#4e6170',
          grisSombra: '#F3F3F3',
          verdeLetras: '#077341',
          verdeCheck: '#59915E',
          grisFondo: '#F4F6F7',
          grisLetras: '#535353'
        },

      },
    },
    fontFamily: {
      // roboto: ['Roboto', 'sans-serif'],
      // 'open-sans': ['Open Sans', 'sans'],
      goldplay: ['Goldplay', 'sans-serif'],
    },

  },
  plugins: [],
}
