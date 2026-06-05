import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

function readBackendPort(): number {
  try {
    return parseInt(fs.readFileSync(path.resolve(__dirname, '.backend-port'), 'utf-8').trim(), 10)
  } catch {
    return 5000
  }
}

export default defineConfig(() => {
  const backendPort = readBackendPort()
  const backendUrl = `http://localhost:${backendPort}`

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': { target: backendUrl, changeOrigin: true },
        '/socket.io': { target: backendUrl, ws: true },
      },
    },
  }
})
