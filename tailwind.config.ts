import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f', // Very dark greyish purple
        card: '#16151d', // Dark purple-grey for cards
        'card-hover': '#1d1c26', // Slightly lighter for hover
        text: '#e2e8f0', // Keep text light
        primary: '#ff6b35', // Vibrant orange
        'primary-hover': '#ff8555', // Lighter orange for hover
        secondary: '#f7931e', // Golden orange
        accent: '#ff4757', // Red accent
        'accent-hover': '#ff6b7a', // Lighter red for hover
      },
      screens: {
        '3xl': '1920px', // For larger monitors
        '4xl': '2560px', // For 2560px+ monitors
      },
    },
  },
  plugins: [],
}
export default config

