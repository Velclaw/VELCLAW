// Keep Autoship's Vite/PostCSS pipeline isolated from the root Next.js app.
// Tailwind v4 is processed by @tailwindcss/vite in vite.config.ts.
export default {
  plugins: {
    autoprefixer: {},
  },
}
