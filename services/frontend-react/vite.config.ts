import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const stripNodeModulesSourcemaps: Plugin = {
    name: 'strip-node-modules-sourcemaps',
    enforce: 'pre',
    transform(code, id) {
        if (id.includes('/node_modules/') && /\.js(\?|$)/.test(id)) {
            // Remove line sourcemap comments and block sourcemap comments
            const withoutLine = code.replace(/\/\/[#@]\s*sourceMappingURL=.*$/gm, '')
            const withoutBlock = withoutLine.replace(/\/\*[#@]\s*sourceMappingURL=[\s\S]*?\*\//gm, '')
            return { code: withoutBlock, map: null }
        }
        return null
    }
}

export default defineConfig({
    plugins: [react(), stripNodeModulesSourcemaps],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    server: {
        host: process.env.VITE_HOST || '127.0.0.1'
    }
})
