import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/docs.velclaw.ai/',
  plugins: [react()],
})
