import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia } from 'pinia';
import { useAuthStore } from './auth';
import { apiService } from '@/services/apiService';
import { jwtDecode } from 'jwt-decode';
import { createTestingPinia } from '@pinia/testing';
import type { User, CreateUserDto, Lookup, UpdateUserDto } from '@/models';

// ==========================
// Mocks
// ==========================
vi.mock('@/services/apiService');
vi.mock('jwt-decode');
vi.mock('@/router', () => ({ default: { push: vi.fn() } }));

// Simula localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => (store[key] = value.toString()),
    removeItem: (key: string) => delete store[key],
    clear: () => (store = {}),
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

// ==========================
// Test Suite
// ==========================
describe('Auth Store', () => {
  const FAKE_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJyb2xlcyI6WyJJTlNQRUNUT1IiXSwiZXhwIjo5OTk5OTk5OTk5fQ.fake-signature';
  const DECODED_FAKE_TOKEN = {
    sub: 1,
    username: 'testuser',
    roles: ['INSPECTOR'],
    exp: 9999999999,
  };

  beforeEach(() => {
    // Permite chamadas reais entre actions da mesma store
    setActivePinia(
      createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
      }),
    );
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ======================================================
  // TESTES DE AUTENTICAÇÃO
  // ======================================================
  describe('actions: Autenticação', () => {
    it('deve logar com sucesso e armazenar token/localStorage', async () => {
      const authStore = useAuthStore();
      const credentials = { loginIdentifier: 'testuser', password: 'password' };

      vi.mocked(apiService.login).mockResolvedValue({ access_token: FAKE_TOKEN });
      vi.mocked(jwtDecode).mockReturnValue(DECODED_FAKE_TOKEN);

      await authStore.login(credentials);

      expect(apiService.login).toHaveBeenCalledWith(credentials);
      expect(authStore.isAuthenticated).toBe(true);
      expect(localStorage.getItem('authToken')).toBe(FAKE_TOKEN);
      expect(authStore.user?.username).toBe('testuser');
    });

    it('deve falhar no login e limpar o estado/localStorage', async () => {
      const authStore = useAuthStore();
      const credentials = { loginIdentifier: 'user', password: 'wrong' };

      vi.mocked(apiService.login).mockRejectedValue(new Error('Credenciais inválidas'));

      await authStore.login(credentials);

      expect(authStore.isAuthenticated).toBe(false);
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(authStore.loginError).toBe('Credenciais inválidas');
    });
  });

  // ======================================================
  // TESTES DE GESTÃO DE USUÁRIOS (ADMIN)
  // ======================================================
  describe('actions: User Management', () => {
    let authStore: ReturnType<typeof useAuthStore>;
    beforeEach(() => {
      authStore = useAuthStore();
    });

    it('fetchUsers deve chamar getUsers e preencher o estado', async () => {
      const mockUsers: User[] = [{ id: 1, fullName: 'Test User' } as User];
      vi.mocked(apiService.getUsers).mockResolvedValue(mockUsers);

      await authStore.fetchUsers();

      expect(apiService.getUsers).toHaveBeenCalledTimes(1);
      expect(authStore.users).toEqual(mockUsers);
      expect(authStore.managementStatus).toBe('idle');
    });

    it('fetchUsers deve registrar um erro em caso de falha', async () => {
      const apiError = new Error('Falha na API');
      vi.mocked(apiService.getUsers).mockRejectedValue(apiError);

      await authStore.fetchUsers();

      expect(authStore.managementStatus).toBe('error');
      expect(authStore.managementError).toBe(apiError.message);
    });

    it('fetchRoles deve chamar getRoles e preencher o estado', async () => {
      const mockRoles: Lookup[] = [{ id: 1, name: 'ADMIN' }];
      vi.mocked(apiService.getRoles).mockResolvedValue(mockRoles);

      await authStore.fetchRoles();

      expect(apiService.getRoles).toHaveBeenCalledTimes(1);
      expect(authStore.roles).toEqual(mockRoles);
      expect(authStore.managementStatus).toBe('idle');
    });

    it('createUser deve chamar a API e re-buscar a lista de usuários', async () => {
      const newUserDto: CreateUserDto = {
        fullName: 'New User',
        username: 'new',
        email: 'new@new.com',
        password: '123',
        roleIds: [1],
      };
      vi.mocked(apiService.createUser).mockResolvedValue({} as any);
      vi.mocked(apiService.getUsers).mockResolvedValue([]);

      await authStore.createUser(newUserDto);

      expect(apiService.createUser).toHaveBeenCalledWith(newUserDto);
      expect(apiService.getUsers).toHaveBeenCalledTimes(1);
    });

    it('updateUser deve chamar a API e re-buscar a lista', async () => {
      const updateUserDto: UpdateUserDto = { fullName: 'Updated Name' };
      vi.mocked(apiService.updateUser).mockResolvedValue({} as any);
      vi.mocked(apiService.getUsers).mockResolvedValue([]);

      await authStore.updateUser(1, updateUserDto);

      expect(apiService.updateUser).toHaveBeenCalledWith(1, updateUserDto);
      expect(apiService.getUsers).toHaveBeenCalledTimes(1);
    });

    it('deleteUser deve chamar a API e re-buscar a lista', async () => {
      vi.mocked(apiService.softDeleteUser).mockResolvedValue();
      vi.mocked(apiService.getUsers).mockResolvedValue([]);

      await authStore.deleteUser(1);

      expect(apiService.softDeleteUser).toHaveBeenCalledWith(1);
      expect(apiService.getUsers).toHaveBeenCalledTimes(1);
    });
  });
});
