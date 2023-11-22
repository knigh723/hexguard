import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens:{
      'max-lg':{'max':'1023px'},
      'max-md':{'max':'767px'},
      'max-sm':{'max':'639px'},
      'sm': '640px',
      'md': '768px',
      'lg':'1024px'

    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    fontFamily:{
      'opensans':['Open Sans', 'sans']
    }
  },
  plugins: [require('@tailwindcss/typography'),require("daisyui")],
  daisyui:{
    themes:["light","dark"]
  }
}
export default config
