/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Import a store que vamos usar
import { useAuthStore } from './stores/auth'

// Styles
import 'unfonts.css'

const app = createApp(App)

// Primeiro, registramos todos os plugins (incluindo o Pinia)
registerPlugins(app)

// AGORA, com o Pinia já registrado, podemos usar a store.
const authStore = useAuthStore();

// Verificamos se há uma sessão ativa no localStorage.
authStore.checkAuthStatus();

// Finalmente, montamos a aplicação com o estado de autenticação já resolvido.
app.mount('#app')