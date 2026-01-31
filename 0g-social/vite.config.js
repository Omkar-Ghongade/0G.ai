import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const stubs = path.resolve(__dirname, 'src/lib/stubs')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['crypto', 'buffer', 'stream', 'util', 'events'],
    }),
  ],
  resolve: {
    alias: {
      fs: path.join(stubs, 'fs.js'),
      path: path.join(stubs, 'path.js'),
      'node:fs/promises': path.join(stubs, 'node-fs-promises.js'),
      vm: path.join(stubs, 'vm.js'),
    },
  },
})
