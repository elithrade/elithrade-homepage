import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The project writes JSX in plain .js files (Next.js allows this). Vite's
  // oxc transform skips .js by default, so opt our source dirs in as JSX.
  oxc: {
    include: /\/(components|pages|libs|test)\/.+\.js$/,
    exclude: /node_modules/,
    lang: 'jsx',
    jsx: { runtime: 'automatic' }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js'],
    include: ['{components,libs,pages,test}/**/*.test.js'],
    css: false
  }
})
