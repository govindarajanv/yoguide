/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://<user>.github.io/yoga-schedule/
export default defineConfig({
  plugins: [react()],
  // CI sets VITE_BASE=/yoga-schedule/ for GitHub Pages project sites
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
