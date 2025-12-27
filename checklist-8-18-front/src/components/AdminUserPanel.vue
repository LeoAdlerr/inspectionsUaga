<template>
  <div>
    <div class="d-flex justify-space-between align-center flex-wrap ga-4 mb-4">
      <h1 class="text-h4 font-weight-bold">Gestão de Usuários</h1>
      <v-btn color="primary" prepend-icon="mdi-plus-circle-outline" @click="openUserDialog()">
        Novo Usuário
      </v-btn>
    </div>

    <v-card class="mb-4">
      <v-card-text class="d-flex ga-4 align-center flex-wrap">
        <span class="font-weight-medium">Filtrar por Status:</span>
        <v-btn-toggle v-model="statusFilter" mandatory color="primary" variant="outlined" density="compact">
          <v-btn value="all">Todos</v-btn>
          <v-btn value="active">Ativos</v-btn>
          <v-btn value="inactive">Inativos</v-btn>
        </v-btn-toggle>
      </v-card-text>
    </v-card>

    <v-card>
      <v-data-table :headers="headers" :items="filteredUsers" :loading="isLoading" loading-text="Buscando usuários..."
        no-data-text="Nenhum usuário encontrado para o filtro selecionado" class="elevation-1">
        <template #item.isActive="{ value }">
          <v-chip :color="value ? 'success' : 'grey'" size="small">
            {{ value ? 'Ativo' : 'Inativo' }}
          </v-chip>
        </template>
        <template #item.roles="{ value }">
          <div class="d-flex ga-1 flex-wrap">
            <v-chip v-for="role in value" :key="role.id" size="small">{{ role.name }}</v-chip>
          </div>
        </template>
        <template #item.actions="{ item }">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-icon v-bind="props" small class="mr-3" :disabled="isCurrentUser(item)"
                @click="openUserDialog(item)">mdi-pencil</v-icon>
            </template>
            <span>{{ isCurrentUser(item) ? 'Edite seu perfil na tela "Meu Perfil"' : 'Editar Usuário' }}</span>
          </v-tooltip>
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-icon v-bind="props" small class="mr-3" @click="openResetPasswordDialog(item)">mdi-lock-reset</v-icon>
            </template>
            <span>Resetar Senha</span>
          </v-tooltip>
          <<v-tooltip location="top">
            <template #activator="{ props }">
              <v-icon v-bind="props" small :color="item.isActive ? 'error' : 'success'" :disabled="isCurrentUser(item)"
                @click="confirmToggleActive(item)">
                {{ item.isActive ? 'mdi-eye-off' : 'mdi-eye' }}
              </v-icon>
            </template>
            <span>{{ isCurrentUser(item) ? 'Não é possível desativar a si mesmo' : (item.isActive ? 'Desativar'
              : 'Reativar') +
              'Usuário' }}</span>
            </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="isUserDialogOpen" max-width="700px" persistent>
      <v-card>
        <v-card-title class="pa-4 bg-primary">
          <span class="text-h5">{{ isEditing ? 'Editar Usuário' : 'Criar Novo Usuário' }}</span>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form ref="userFormRef">
            <v-row>
              <v-col cols="12"><v-text-field v-model="formData.fullName" label="Nome Completo" :rules="[rules.required]"
                  variant="outlined" density="compact"></v-text-field></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="formData.username" label="Username"
                  :rules="[rules.required]" variant="outlined" density="compact"></v-text-field></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="formData.email" label="Email"
                  :rules="[rules.required, rules.email]" variant="outlined" density="compact"></v-text-field></v-col>
              <v-col v-if="!isEditing" cols="12"><v-text-field v-model="formData.password" label="Senha" type="password"
                  :rules="[rules.required]" variant="outlined" density="compact"></v-text-field></v-col>
              <v-col cols="12">
                <v-select v-model="formData.roleIds" :items="roles" item-title="name" item-value="id"
                  label="Perfis de Acesso" multiple chips closable-chips variant="outlined"
                  density="compact"></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text @click="closeUserDialog">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveUser">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isResetPasswordDialogOpen" max-width="500px" persistent>
      <v-card>
        <v-card-title class="pa-4 bg-primary">
          <span class="text-h5">Resetar Senha para {{ selectedUser?.fullName }}</span>
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="mb-4">Digite a nova senha para o usuário. Se deixar em branco, uma senha padrão será gerada.</p>
          <v-form @submit.prevent="handleResetPassword">
            <v-text-field v-model="newPassword" label="Nova Senha (8+ caracteres)" type="password" variant="outlined"
              density="compact" clearable></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text @click="isResetPasswordDialogOpen = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="handleResetPassword">Resetar Senha</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

  <script lang="ts" setup>
  import { onMounted, computed, ref, reactive } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import type { User, CreateUserDto, UpdateUserDto } from '@/models';

  const authStore = useAuthStore();
  const { users, managementStatus, user: currentUser, roles } = storeToRefs(authStore);
  const isLoading = computed(() => managementStatus.value === 'loading');

  // --- Estado local (sem a declaração duplicada de 'roles') ---
  const isUserDialogOpen = ref(false);
  const isResetPasswordDialogOpen = ref(false);
  const isEditing = ref(false);
  const selectedUser = ref<User | null>(null);
  const userFormRef = ref<any>(null);
  const newPassword = ref('');
  const statusFilter = ref<'all' | 'active' | 'inactive'>('all');
  const formData = reactive<Partial<CreateUserDto & UpdateUserDto>>({});
  const snackbar = reactive({ show: false, text: '', color: 'success' });

  // --- Regras de Validação ---
  const rules = {
    required: (v: any) => !!v || 'Campo obrigatório',
    email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
  };

  const isCurrentUser = (user: User) => {
    return currentUser.value?.id === user.id;
  };

  const filteredUsers = computed(() => {
    if (statusFilter.value === 'active') {
      return users.value.filter(user => user.isActive);
    }
    if (statusFilter.value === 'inactive') {
      return users.value.filter(user => !user.isActive);
    }
    return users.value;
  });

  // --- Funções dos Diálogos ---
  const openUserDialog = (user: User | null = null) => {
    selectedUser.value = user;
    isEditing.value = !!user;

    if (user) {
      formData.fullName = user.fullName;
      formData.username = user.username;
      formData.email = user.email;
      formData.roleIds = user.roles.map(r => r.id);
    } else {
      // Limpa o formulário para criação
      formData.fullName = '';
      formData.username = '';
      formData.email = '';
      formData.password = '';
      formData.roleIds = [];
    }
    isUserDialogOpen.value = true;
  };

  const closeUserDialog = () => {
    isUserDialogOpen.value = false;
    userFormRef.value?.reset();
    userFormRef.value?.resetValidation();
  };


  const openResetPasswordDialog = (user: User) => {
    selectedUser.value = user;
    newPassword.value = '';
    isResetPasswordDialogOpen.value = true;
  };

  // --- Funções de Ação (CRUD) ---
  const saveUser = async () => {
    const { valid } = await userFormRef.value?.validate();
    if (!valid) return;

    try {
      if (isEditing.value && selectedUser.value) {
        if (isCurrentUser(selectedUser.value) && !formData.roleIds?.includes(1)) {
          showSnackbar('Você não pode remover seu próprio perfil de Administrador.', 'error');
          return;
        }
        await authStore.updateUser(selectedUser.value.id, formData as UpdateUserDto);
        showSnackbar('Usuário atualizado com sucesso!');
      } else {
        await authStore.createUser(formData as CreateUserDto);
        showSnackbar('Usuário criado com sucesso!');
      }
      closeUserDialog();
    } catch (error) {
      showSnackbar(`Erro ao salvar: ${(error as Error).message}`, 'error');
    }
  };

  const handleResetPassword = async () => {
    if (selectedUser.value) {
      try {
        await authStore.resetUserPassword(selectedUser.value.id, { newPassword: newPassword.value });
        isResetPasswordDialogOpen.value = false;
        showSnackbar('Senha redefinida com sucesso!');
      } catch (error) {
        showSnackbar(`Erro ao resetar senha: ${(error as Error).message}`, 'error');
      }
    }
  };

  const showSnackbar = (text: string, color = 'success') => {
    snackbar.text = text;
    snackbar.color = color;
    snackbar.show = true;
  };

  const confirmToggleActive = async (user: User) => {
    if (isCurrentUser(user)) {
      showSnackbar('Você não pode desativar a si mesmo.', 'warning');
      return;
    }
    const action = user.isActive ? 'desativar' : 'reativar';
    if (confirm(`Tem certeza que deseja ${action} o usuário ${user.fullName}?`)) {
      try {
        await authStore.updateUser(user.id, { isActive: !user.isActive });
        showSnackbar(`Usuário ${action} com sucesso!`);
      } catch (error) {
        showSnackbar(`Erro ao ${action} o usuário: ${(error as Error).message}`, 'error');
      }
    }
  };

  // --- Configuração da Tabela ---
  const headers = [
    { title: 'ID', key: 'id', width: '80px' },
    { title: 'Nome Completo', key: 'fullName' },
    { title: 'Username', key: 'username' },
    { title: 'Status', key: 'isActive' },
    { title: 'Perfis', key: 'roles' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center', width: '150px' },
  ] as const;

  // --- Inicialização ---
  onMounted(() => {
    authStore.fetchUsers();
    authStore.fetchRoles();
  });
</script>