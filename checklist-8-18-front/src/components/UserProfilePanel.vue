<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-4">Meu Perfil</h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Suas Informações</v-card-title>
          <v-list>
            <v-list-item title="Nome de Usuário" :subtitle="authStore.user?.username"></v-list-item>
            <v-list-item title="ID de Usuário" :subtitle="authStore.user?.id"></v-list-item>
            <v-list-item title="Perfis de Acesso" :subtitle="authStore.user?.roles.join(', ')"></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Alterar Senha</v-card-title>
          <v-card-text>
            <v-form ref="formRef" @submit.prevent="submitChangePassword">
              <v-text-field
                v-model="passwords.oldPassword"
                label="Senha Atual"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-4"
                :rules="[rules.required]"
              ></v-text-field>
              <v-text-field
                v-model="passwords.newPassword"
                label="Nova Senha"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-4"
                :rules="[rules.required]"
              ></v-text-field>
              
              <v-text-field
                v-model="passwords.confirmNewPassword"
                label="Confirmar Nova Senha"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-4"
                :rules="[rules.required, rules.passwordMatch]"
              ></v-text-field>

              <v-btn type="submit" color="primary" :loading="isSubmitting">
                Salvar Nova Senha
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { VForm } from 'vuetify/components';

const authStore = useAuthStore();
const isSubmitting = ref(false);
const formRef = ref<VForm | null>(null);

const passwords = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '', // CAMPO ADICIONADO
});

// REGRAS DE VALIDAÇÃO
const rules = {
  required: (v: string) => !!v || 'Campo obrigatório.',
  passwordMatch: (v: string) => v === passwords.newPassword || 'As senhas não conferem.',
};

const submitChangePassword = async () => {
  const { valid } = await formRef.value?.validate() ?? { valid: false };
  if (!valid) return;

  isSubmitting.value = true;
  try {
    // Enviamos para a API apenas os campos necessários (sem a confirmação)
    await authStore.changeMyPassword({
      oldPassword: passwords.oldPassword,
      newPassword: passwords.newPassword,
    });
    alert('Senha alterada com sucesso!');
    // Limpa todos os campos após o sucesso
    formRef.value?.reset();
  } catch (error) {
    alert(`Erro ao alterar a senha: ${(error as Error).message}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>