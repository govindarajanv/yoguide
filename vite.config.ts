/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://govindarajanv.github.io/yoguide/
export default defineConfig({
  plugins: [react()],
  // CI sets VITE_BASE=/yoguide/ for the GitHub Pages project site.
  base: process.env.VITE_BASE ?? '/',
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
  },
})
