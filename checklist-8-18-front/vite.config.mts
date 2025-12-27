/// <reference types="vitest" />

// Plugins
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Fonts from 'unplugin-fonts/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
import { configDefaults } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Este plugin é essencial para a qualidade de vida.
    // Ele importa automaticamente funções como ref, computed, defineStore, etc.
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        {
          pinia: ['defineStore', 'storeToRefs'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),

    // Parceiro do AutoImport, este plugin importa automaticamente
    // os componentes que criamos na pasta /src/components.
    Components({
      dts: 'src/components.d.ts',
    }),

    Vue({
      template: { transformAssetUrls },
    }),

    // Configuração principal do Vuetify.
    // O autoImport: true depende dos plugins acima para funcionar.
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),

    // Plugin para carregar fontes locais ou do Google Fonts de forma otimizada.
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
        ],
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 5173,
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      },
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    deps: {
      inline: ['vuetify'],
    },
    exclude: [
      ...configDefaults.exclude,
      'e2e/**',
    ],
  },
})