const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      
      colors: {
        background: 'hsl(222.2 84% 4.9%)',
        foreground: 'hsl(210 40% 98%)',
        muted: 'hsl(217.2 32.6% 17.5%)',
        'muted-foreground': 'hsl(215 20.2% 65.1%)',
        card: 'hsl(217.2 32.6% 17.5%)',
        'card-foreground': 'hsl(210 40% 98%)',
        popover: 'hsl(222.2 84% 4.9%)',
        'popover-foreground': 'hsl(210 40% 98%)',
        primary: 'hsl(210 40% 98%)',
        'primary-foreground': 'hsl(222.2 47.4% 11.2%)',
        secondary: 'hsl(217.2 32.6% 17.5%)',
        'secondary-foreground': 'hsl(210 40% 98%)',
        accent: 'hsl(217.2 91.2% 59.8%)',
        'accent-foreground': 'hsl(210 40% 98%)',
        destructive: 'hsl(0 62.8% 30.6%)',
        'destructive-foreground': 'hsl(210 40% 98%)',
        border: 'hsl(217.2 32.6% 17.5%)',
        input: 'hsl(217.2 32.6% 17.5%)',
        ring: 'hsl(217.2 91.2% 59.8%)',
      },
      fontFamily: {
        sans: ['var(--font-poiret-one)', ...fontFamily.sans],
        heading: ['var(--font-oswald)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}
