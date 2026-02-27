import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/agent_builder': {
          target: env.ELASTIC_KIBANA_URL,
          changeOrigin: true,
          secure: true,
          headers: {
            'Authorization': `ApiKey ${env.ELASTIC_API_KEY}`,
            'kbn-xsrf': 'true',
          },
        },
        '/api/es': {
          target: env.ELASTIC_ES_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (path: string) => path.replace(/^\/api\/es/, ''),
          headers: {
            'Authorization': `ApiKey ${env.ELASTIC_API_KEY}`,
          },
        },
      },
    },
  }
})
