import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite'
import plugin from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [plugin()],
        define: {
            __APP_ENV__: JSON.stringify(env.APP_ENV),
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        base: './',
        server: {
            port: 5173
        },
        build: {
            outDir: 'dist',
            emptyOutDir: true
        }
    }
})
