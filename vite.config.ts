import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import visualizer from 'rollup-plugin-visualizer'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default (
  ({ mode }) => defineConfig({
    base: `/${loadEnv(mode, process.cwd()).VITE_APP_PREFIX}/`,
    build: {
      assetsDir: 'assets',
      // 去除console
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          assetFileNames: 'css/[name].[hash].css',
          chunkFileNames: 'js/[name].[hash].js',
          entryFileNames: 'js/[name].[hash].js',
        },
      },
    },
    server: {
      port: 8888,
      open: true,
      strictPort: true,
      fs: {
        allow: ['.'],
      },
      // proxy: {
      //   '^/api': {
      //     target: 'http://127.0.0.1:3000/',
      //     changeOrigin: true,
      //   },
      // },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          modifyVars: {},
          javascriptEnabled: true,
        },
        less: {
          modifyVars: {
            'primary-color': '#1abc9c',
            'link-color': '#1DA57A',
            'border-radius-base': '2px',
          },
          javascriptEnabled: true,
        },
      },
    },
    plugins: [
      vue(),
      visualizer({
        filename: './node_modules/.cache/stats.html',
        // open: true,
        gzipSize: true,
        brotliSize: true,
      }),
      vueJsx({}),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
    ],
  })
)