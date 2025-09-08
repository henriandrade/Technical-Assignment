import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const stripNodeModulesSourcemaps: Plugin = {
    name: 'strip-node-modules-sourcemaps',
    enforce: 'pre',
    transform(code, id) {
        if ((id.includes('/node_modules/') || id.includes('/.vite/deps/')) && /\.(js|css)(\?|$)/.test(id)) {
            const withoutLine = code.replace(/\/\/[#@]\s*sourceMappingURL=.*$/gm, '')
            const withoutBlock = withoutLine.replace(/\/\*[#@]\s*sourceMappingURL=[\s\S]*?\*\//gm, '')
            return { code: withoutBlock, map: null }
        }
        return null
    }
}

const suppressSourceMapRequests: Plugin = {
    name: 'suppress-sourcemap-requests',
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            if (req.url && /\.(js|css)\.map($|\?)/.test(req.url) && (req.url.includes('/node_modules/') || req.url.includes('/.vite/'))) {
                res.statusCode = 204
                return res.end()
            }
            next()
        })
    }
}

export default defineConfig({
    cacheDir: 'node_modules/.vite',
    plugins: [
        react(),
        stripNodeModulesSourcemaps,
        suppressSourceMapRequests
    ],
    optimizeDeps: {
        include: [
            'zustand',
            'use-sync-external-store',
            'use-sync-external-store/shim/with-selector.js'
        ],
        exclude: [],
        esbuildOptions: { target: 'esnext', sourcemap: false }
    },
    esbuild: {
        target: 'esnext'
    },
    build: {
        target: 'esnext',
        sourcemap: false,
        modulePreload: {
            polyfill: false
        }
    },
    css: {
        devSourcemap: false
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'three/addons': 'three/examples/jsm'
        }
    },
    server: {
        host: process.env.VITE_HOST || '127.0.0.1',
        fs: { strict: true }
    }
})
