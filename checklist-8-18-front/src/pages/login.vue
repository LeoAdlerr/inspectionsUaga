<template>
  <v-app>
    <v-app-bar color="blue-darken-4" density="compact" elevation="2">
      <template #prepend>
        <v-avatar class="ms-4">
          <v-img src="@/assets/universal-logo.png" alt="Universal Logotipo" />
        </v-avatar>
      </template>
      <v-app-bar-title class="font-weight-bold text-uppercase">
        UAGA Inspections
      </v-app-bar-title>
      <template #append>
        <v-avatar class="me-4" size="32">
          <v-img src="@/assets/coruja-logo.png" alt="Coruja UAGA T.I."></v-img>
        </v-avatar>
      </template>
    </v-app-bar>

    <v-main class="bg-white d-flex align-center justify-center">
      <v-card :loading="isLoading" elevation="16" width="90%" max-width="450px" class="pa-sm-4">
        <v-card-text class="text-center">
          <v-avatar size="64" class="mb-4">
            <v-img src="@/assets/coruja-logo.png" alt="Coruja UAGA T.I."></v-img>
          </v-avatar>
          <h1 class="text-h5 text-sm-h4 font-weight-bold text-primary mb-2">
            Plataforma de Inspeções
          </h1>
          <p class="text-medium-emphasis mb-6">
            Módulo: Checklist 8/18
          </p>
        </v-card-text>

        <v-card-text>
          <v-form ref="formRef" @submit.prevent="handleLogin">
            <v-text-field v-model="credentials.loginIdentifier" label="Usuário ou E-mail"
              prepend-inner-icon="mdi-account-circle" variant="outlined" :rules="[rules.required]" class="mb-4"
              data-testid="login-input"></v-text-field>

            <v-text-field v-model="credentials.password" label="Senha" prepend-inner-icon="mdi-lock" variant="outlined"
              type="password" :rules="[rules.required]" class="mb-2" data-testid="password-input"></v-text-field>

            <v-alert v-if="loginError" type="error" variant="tonal" density="compact" class="mb-4 text-left"
              data-testid="error-alert">
              {{ loginError }}
            </v-alert>

            <v-btn :loading="isLoading" type="submit" color="yellow-darken-2" size="large" block
              class="mt-2 font-weight-bold" data-testid="submit-btn">
              Entrar
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-main>

    <v-footer app class="d-flex flex-column pa-0">
      <div class="bg-blue-darken-4 text-center w-100 pa-2">
        <strong>Universal Armazéns Gerais e Alfandegados</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { loginStatus, loginError } = storeToRefs(authStore);

const formRef = ref<any>(null);
const credentials = reactive({
  loginIdentifier: '',
  password: '',
});

const isLoading = computed(() => loginStatus.value === 'loading');

const rules = {
  required: (value: string) => !!value || 'Este campo é obrigatório.',
};

const handleLogin = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    await authStore.login(credentials);
  }
};
</script>