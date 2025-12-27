// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
// O import deve corresponder ao nome correto do pacote que instalamos.
import vuetify from 'eslint-plugin-vuetify';

export default tseslint.config(
  // O resto do arquivo permanece exatamente o mesmo
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/vue3-recommended'],
  ...vuetify.configs['flat/recommended'],
  {
    rules: {
      // Regras customizadas
    },
  }
);