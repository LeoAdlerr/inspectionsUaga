// vite.config.mts
import AutoImport from "file:///C:/git/inspectionsUaga/checklist-8-18-front/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///C:/git/inspectionsUaga/checklist-8-18-front/node_modules/unplugin-vue-components/dist/vite.js";
import Fonts from "file:///C:/git/inspectionsUaga/checklist-8-18-front/node_modules/unplugin-fonts/dist/vite.mjs";
import Vue from "file:///C:/git/inspectionsUaga/checklist-8-18-front/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Vuetify, { transformAssetUrls } from "file:///C:/git/inspectionsUaga/checklist-8-18-front/node_modules/vite-plugin-vuetify/dist/index.mjs";
import { defineConfig } from "file:///C:/git/inspectionsUaga/checklist-8-18-front/node_modules/vitest/dist/config.js";
import { fileURLToPath, URL } from "node:url";
import { configDefaults } from "file:///C:/git/inspectionsUaga/checklist-8-18-front/node_modules/vitest/dist/config.js";
var __vite_injected_original_import_meta_url = "file:///C:/git/inspectionsUaga/checklist-8-18-front/vite.config.mts";
var vite_config_default = defineConfig({
  plugins: [
    // Este plugin é essencial para a qualidade de vida.
    // Ele importa automaticamente funções como ref, computed, defineStore, etc.
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        {
          pinia: ["defineStore", "storeToRefs"]
        }
      ],
      dts: "src/auto-imports.d.ts",
      eslintrc: {
        enabled: true
      },
      vueTemplate: true
    }),
    // Parceiro do AutoImport, este plugin importa automaticamente
    // os componentes que criamos na pasta /src/components.
    Components({
      dts: "src/components.d.ts"
    }),
    Vue({
      template: { transformAssetUrls }
    }),
    // Configuração principal do Vuetify.
    // O autoImport: true depende dos plugins acima para funcionar.
    Vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss"
      }
    }),
    // Plugin para carregar fontes locais ou do Google Fonts de forma otimizada.
    Fonts({
      fontsource: {
        families: [
          {
            name: "Roboto",
            weights: [100, 300, 400, 500, 700, 900],
            styles: ["normal", "italic"]
          }
        ]
      }
    })
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", __vite_injected_original_import_meta_url))
    },
    extensions: [
      ".js",
      ".json",
      ".jsx",
      ".mjs",
      ".ts",
      ".tsx",
      ".vue"
    ]
  },
  server: {
    port: 3030
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern-compiler"
      },
      scss: {
        api: "modern-compiler"
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    deps: {
      inline: ["vuetify"]
    },
    exclude: [
      ...configDefaults.exclude,
      "e2e/**"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcZ2l0XFxcXGluc3BlY3Rpb25zVWFnYVxcXFxjaGVja2xpc3QtOC0xOC1mcm9udFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcZ2l0XFxcXGluc3BlY3Rpb25zVWFnYVxcXFxjaGVja2xpc3QtOC0xOC1mcm9udFxcXFx2aXRlLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L2dpdC9pbnNwZWN0aW9uc1VhZ2EvY2hlY2tsaXN0LTgtMTgtZnJvbnQvdml0ZS5jb25maWcubXRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxyXG5cclxuLy8gUGx1Z2luc1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xyXG5pbXBvcnQgRm9udHMgZnJvbSAndW5wbHVnaW4tZm9udHMvdml0ZSdcclxuaW1wb3J0IFZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBWdWV0aWZ5LCB7IHRyYW5zZm9ybUFzc2V0VXJscyB9IGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZXRpZnknXHJcblxyXG4vLyBVdGlsaXRpZXNcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZydcclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcbmltcG9ydCB7IGNvbmZpZ0RlZmF1bHRzIH0gZnJvbSAndml0ZXN0L2NvbmZpZydcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgLy8gRXN0ZSBwbHVnaW4gXHUwMEU5IGVzc2VuY2lhbCBwYXJhIGEgcXVhbGlkYWRlIGRlIHZpZGEuXHJcbiAgICAvLyBFbGUgaW1wb3J0YSBhdXRvbWF0aWNhbWVudGUgZnVuXHUwMEU3XHUwMEY1ZXMgY29tbyByZWYsIGNvbXB1dGVkLCBkZWZpbmVTdG9yZSwgZXRjLlxyXG4gICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgIGltcG9ydHM6IFtcclxuICAgICAgICAndnVlJyxcclxuICAgICAgICAndnVlLXJvdXRlcicsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcGluaWE6IFsnZGVmaW5lU3RvcmUnLCAnc3RvcmVUb1JlZnMnXSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBkdHM6ICdzcmMvYXV0by1pbXBvcnRzLmQudHMnLFxyXG4gICAgICBlc2xpbnRyYzoge1xyXG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gUGFyY2Vpcm8gZG8gQXV0b0ltcG9ydCwgZXN0ZSBwbHVnaW4gaW1wb3J0YSBhdXRvbWF0aWNhbWVudGVcclxuICAgIC8vIG9zIGNvbXBvbmVudGVzIHF1ZSBjcmlhbW9zIG5hIHBhc3RhIC9zcmMvY29tcG9uZW50cy5cclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJyxcclxuICAgIH0pLFxyXG5cclxuICAgIFZ1ZSh7XHJcbiAgICAgIHRlbXBsYXRlOiB7IHRyYW5zZm9ybUFzc2V0VXJscyB9LFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gQ29uZmlndXJhXHUwMEU3XHUwMEUzbyBwcmluY2lwYWwgZG8gVnVldGlmeS5cclxuICAgIC8vIE8gYXV0b0ltcG9ydDogdHJ1ZSBkZXBlbmRlIGRvcyBwbHVnaW5zIGFjaW1hIHBhcmEgZnVuY2lvbmFyLlxyXG4gICAgVnVldGlmeSh7XHJcbiAgICAgIGF1dG9JbXBvcnQ6IHRydWUsXHJcbiAgICAgIHN0eWxlczoge1xyXG4gICAgICAgIGNvbmZpZ0ZpbGU6ICdzcmMvc3R5bGVzL3NldHRpbmdzLnNjc3MnLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gUGx1Z2luIHBhcmEgY2FycmVnYXIgZm9udGVzIGxvY2FpcyBvdSBkbyBHb29nbGUgRm9udHMgZGUgZm9ybWEgb3RpbWl6YWRhLlxyXG4gICAgRm9udHMoe1xyXG4gICAgICBmb250c291cmNlOiB7XHJcbiAgICAgICAgZmFtaWxpZXM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ1JvYm90bycsXHJcbiAgICAgICAgICAgIHdlaWdodHM6IFsxMDAsIDMwMCwgNDAwLCA1MDAsIDcwMCwgOTAwXSxcclxuICAgICAgICAgICAgc3R5bGVzOiBbJ25vcm1hbCcsICdpdGFsaWMnXSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgZGVmaW5lOiB7ICdwcm9jZXNzLmVudic6IHt9IH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJ3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgfSxcclxuICAgIGV4dGVuc2lvbnM6IFtcclxuICAgICAgJy5qcycsXHJcbiAgICAgICcuanNvbicsXHJcbiAgICAgICcuanN4JyxcclxuICAgICAgJy5tanMnLFxyXG4gICAgICAnLnRzJyxcclxuICAgICAgJy50c3gnLFxyXG4gICAgICAnLnZ1ZScsXHJcbiAgICBdLFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiAzMDMwLFxyXG4gIH0sXHJcbiAgY3NzOiB7XHJcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgIHNhc3M6IHtcclxuICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInLFxyXG4gICAgICB9LFxyXG4gICAgICBzY3NzOiB7XHJcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICB0ZXN0OiB7XHJcbiAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXHJcbiAgICBzZXR1cEZpbGVzOiAnLi9zcmMvdGVzdC9zZXR1cC50cycsXHJcbiAgICBkZXBzOiB7XHJcbiAgICAgIGlubGluZTogWyd2dWV0aWZ5J10sXHJcbiAgICB9LFxyXG4gICAgZXhjbHVkZTogW1xyXG4gICAgICAuLi5jb25maWdEZWZhdWx0cy5leGNsdWRlLFxyXG4gICAgICAnZTJlLyoqJyxcclxuICAgIF0sXHJcbiAgfSxcclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBR0EsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sU0FBUztBQUNoQixPQUFPLFdBQVcsMEJBQTBCO0FBRzVDLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsZUFBZSxXQUFXO0FBQ25DLFNBQVMsc0JBQXNCO0FBWnVLLElBQU0sMkNBQTJDO0FBZXZQLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQTtBQUFBO0FBQUEsSUFHUCxXQUFXO0FBQUEsTUFDVCxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsVUFDRSxPQUFPLENBQUMsZUFBZSxhQUFhO0FBQUEsUUFDdEM7QUFBQSxNQUNGO0FBQUEsTUFDQSxLQUFLO0FBQUEsTUFDTCxVQUFVO0FBQUEsUUFDUixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0EsYUFBYTtBQUFBLElBQ2YsQ0FBQztBQUFBO0FBQUE7QUFBQSxJQUlELFdBQVc7QUFBQSxNQUNULEtBQUs7QUFBQSxJQUNQLENBQUM7QUFBQSxJQUVELElBQUk7QUFBQSxNQUNGLFVBQVUsRUFBRSxtQkFBbUI7QUFBQSxJQUNqQyxDQUFDO0FBQUE7QUFBQTtBQUFBLElBSUQsUUFBUTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osUUFBUTtBQUFBLFFBQ04sWUFBWTtBQUFBLE1BQ2Q7QUFBQSxJQUNGLENBQUM7QUFBQTtBQUFBLElBR0QsTUFBTTtBQUFBLE1BQ0osWUFBWTtBQUFBLFFBQ1YsVUFBVTtBQUFBLFVBQ1I7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFNBQVMsQ0FBQyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssR0FBRztBQUFBLFlBQ3RDLFFBQVEsQ0FBQyxVQUFVLFFBQVE7QUFBQSxVQUM3QjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUSxFQUFFLGVBQWUsQ0FBQyxFQUFFO0FBQUEsRUFDNUIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxPQUFPLHdDQUFlLENBQUM7QUFBQSxJQUNwRDtBQUFBLElBQ0EsWUFBWTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILHFCQUFxQjtBQUFBLE1BQ25CLE1BQU07QUFBQSxRQUNKLEtBQUs7QUFBQSxNQUNQO0FBQUEsTUFDQSxNQUFNO0FBQUEsUUFDSixLQUFLO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixZQUFZO0FBQUEsSUFDWixNQUFNO0FBQUEsTUFDSixRQUFRLENBQUMsU0FBUztBQUFBLElBQ3BCO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxHQUFHLGVBQWU7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
