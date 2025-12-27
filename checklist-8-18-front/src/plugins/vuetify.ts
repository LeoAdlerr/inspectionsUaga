/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light', // Mude de 'dark' para 'light'
    themes: {
      light: {
        colors: {
          background: '#FFFFFF', // Fundo branco
          surface: '#FFFFFF',    // Superfícies brancas
          primary: '#1976D2',    // Azul primário
          secondary: '#424242',  // Cinza escuro
          error: '#FF5252',      // Vermelho para erros
          info: '#2196F3',       // Azul para informações
          success: '#4CAF50',    // Verde para sucesso
          warning: '#FB8C00',    // Laranja para alertas
          // Cores de texto
          'on-background': '#000000',
          'on-surface': '#000000',
        },
        dark: false,
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#424242',
        },
        dark: true,
      }
    }
  },
})