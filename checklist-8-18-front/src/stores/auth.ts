import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import { apiService } from '@/services/apiService';
import type { AuthState, DecodedToken, LoginCredentials, User, CreateUserDto, UpdateUserDto, ChangePasswordDto, ResetPasswordDto, Lookup } from '@/models';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState & {
    // Status para a operação de login do próprio usuário
    loginStatus: 'idle' | 'loading' | 'error';
    loginError: string | null;
    // Status para operações de gestão de outros usuários (CRUD)
    managementStatus: 'idle' | 'loading' | 'error';
    managementError: string | null;
    // Lista de usuários para a tela de administração
    users: User[];
    roles: Lookup[];

  } => ({
    token: null, // Será inicializado pelo checkAuthStatus
    user: null,
    loginStatus: 'idle',
    loginError: null,
    managementStatus: 'idle',
    managementError: null,
    users: [],
    roles: [],
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRoles: (state) => state.user?.roles || [],
    isAdmin: (state) => state.user?.roles.includes('ADMIN') || false,
  },

  actions: {
    // ===================================================================
    // AÇÕES DE AUTENTICAÇÃO DO PRÓPRIO USUÁRIO
    // ===================================================================

    async login(credentials: LoginCredentials) {
      this.loginStatus = 'loading';
      this.loginError = null;
      try {
        const response = await apiService.login(credentials);
        const token = response.access_token;
        const decodedToken: DecodedToken = jwtDecode(token);

        this.token = token;
        this.user = { id: decodedToken.sub, username: decodedToken.username, roles: decodedToken.roles };
        localStorage.setItem('authToken', token);

        this.loginStatus = 'idle';
        await router.push('/');
      } catch (error) {
        this.loginStatus = 'error';
        this.loginError = (error as Error).message || 'Credenciais inválidas.';
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('authToken');
      router.push('/login');
    },

    checkAuthStatus() {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decodedToken: DecodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 > Date.now()) {
            this.token = token;
            this.user = { id: decodedToken.sub, username: decodedToken.username, roles: decodedToken.roles };
          } else { this.logout(); }
        } catch { this.logout(); }
      }
    },

    async changeMyPassword(data: ChangePasswordDto) {
      // Esta action pode retornar true/false ou simplesmente lançar o erro
      // para o componente tratar e exibir a notificação.
      await apiService.changeMyPassword(data);
    },

    // ===================================================================
    // AÇÕES DE GESTÃO DE USUÁRIOS (ADMIN)
    // ===================================================================

    async fetchUsers(filters?: { role?: string; name?: string }) {
      this.managementStatus = 'loading';
      this.managementError = null;
      try {
        this.users = await apiService.getUsers(filters);
        this.managementStatus = 'idle';
      } catch (error) {
        this.managementStatus = 'error';
        this.managementError = (error as Error).message;
      }
    },

    /**
     * Busca a lista de perfis (roles) disponíveis.
     */
    async fetchRoles(force = false) {
      if (!force && this.roles.length > 0) {
        this.managementStatus = 'idle';
        return;
      }

      this.managementStatus = 'loading';
      this.managementError = null;
      try {
        this.roles = await apiService.getRoles();
        this.managementStatus = 'idle';
      } catch (error) {
        this.managementStatus = 'error';
        this.managementError = (error as Error).message;
      }
    },

    async createUser(data: CreateUserDto) {
      this.managementStatus = 'loading';
      this.managementError = null;
      try {
        await apiService.createUser(data);
        await this.fetchUsers(); // Re-busca a lista para incluir o novo usuário
      } catch (error) {
        this.managementStatus = 'error';
        this.managementError = (error as Error).message;
        throw error; // Lança o erro para o formulário poder tratá-lo
      }
    },

    async updateUser(id: number, data: UpdateUserDto) {
      this.managementStatus = 'loading';
      this.managementError = null;
      try {
        await apiService.updateUser(id, data);
        await this.fetchUsers(); // Re-busca a lista para refletir a alteração
      } catch (error) {
        this.managementStatus = 'error';
        this.managementError = (error as Error).message;
        throw error;
      }
    },

    async resetUserPassword(id: number, data: ResetPasswordDto) {
      await apiService.resetPassword(id, data);
    },

    async deleteUser(id: number) {
      try {
        await apiService.softDeleteUser(id);
        await this.fetchUsers(); // Re-busca a lista para remover o usuário desativado
      } catch (error) {
        this.managementStatus = 'error';
        this.managementError = (error as Error).message;
        throw error;
      }
    }
  },
});