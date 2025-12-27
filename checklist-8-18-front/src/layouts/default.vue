<template>
  <v-app>
    <v-app-bar color="blue-darken-4" density="compact">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title class="font-weight-bold">
        UAGA Inspections
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn @click="authStore.logout()" prepend-icon="mdi-logout" variant="text">
        Sair
      </v-btn>
      <v-avatar class="me-4 ms-2" size="32">
        <v-img src="@/assets/coruja-logo.png" alt="Coruja UAGA T.I."></v-img>
      </v-avatar>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list-item
        prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
        :title="authStore.user?.username"
        :subtitle="authStore.user?.roles.join(', ')"
      ></v-list-item>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        
        <v-menu location="end">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-view-dashboard-outline" title="Módulos"></v-list-item>
          </template>
          <v-list>
            <v-list-item to="/" title="Checklist 8/18"></v-list-item>
          </v-list>
        </v-menu>

        <v-list-item
          prepend-icon="mdi-account-circle-outline"
          title="Meu Perfil"
          to="/profile"
        ></v-list-item>

        <v-list-item
          v-if="authStore.isAdmin"
          prepend-icon="mdi-account-group-outline"
          title="Gestão de Usuários"
          to="/users"
        ></v-list-item>

      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-white">
      <router-view />
    </v-main>

    <v-footer app class="d-flex flex-column pa-0">
      </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const drawer = ref(false);
</script>