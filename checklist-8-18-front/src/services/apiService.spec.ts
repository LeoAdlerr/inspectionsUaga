import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { apiService } from './apiService';
// Importamos TODOS os tipos necessários, incluindo os de usuário
import type {
  LoginCredentials, LoginResponse, UpdateInspectionDto,
  User, CreateUserDto, UpdateUserDto, ChangePasswordDto,
  UpdateInspectionChecklistItemDto,
  CreateInspectionDto
} from '@/models';

global.fetch = vi.fn();

const createFetchResponse = (ok: boolean, data: any, status = 200) => {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (data instanceof Blob) headers.set('Content-Type', data.type);
  if (typeof data === 'string') headers.set('Content-Type', 'text/html');

  return Promise.resolve({
    ok, status, headers,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(data.toString()),
    blob: () => Promise.resolve(data instanceof Blob ? data : new Blob([JSON.stringify(data)])),
  } as Response);
};

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888/api';
}

describe('apiService', () => {
  const MOCK_API_URL = getApiBaseUrl();

  beforeEach(() => {
    (fetch as Mock).mockClear();
    vi.stubGlobal('window', { Cypress: undefined });
    vi.stubEnv('VITE_API_BASE_URL', MOCK_API_URL);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  // ===================================================================
  // SUÍTE DE TESTES: AUTH & USERS
  // ===================================================================

  describe('login', () => {
    it('deve autenticar com sucesso e retornar um token', async () => {
      const credentials: LoginCredentials = { loginIdentifier: 'test', password: 'password' };
      const mockResponse: LoginResponse = { access_token: 'fake-jwt-token' };
      (fetch as Mock).mockReturnValue(createFetchResponse(true, mockResponse, 200));

      const result = await apiService.login(credentials);
      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/auth/login`, expect.any(Object));
      expect(result.access_token).toBe('fake-jwt-token');
    });
  });

  describe('changeMyPassword', () => {
    it('deve enviar uma requisição PATCH para alterar a senha do usuário', async () => {
      const dto: ChangePasswordDto = { oldPassword: '123', newPassword: '456' };
      (fetch as Mock).mockReturnValue(createFetchResponse(true, null, 204));

      await apiService.changeMyPassword(dto);
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/auth/change-my-password`,
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify(dto) })
      );
    });
  });

  describe('getUsers', () => {
    it('deve buscar e retornar uma lista de usuários', async () => {
      const mockUsers: User[] = [{ id: 1, fullName: 'Test User', username: 'test', email: 'test@test.com', isActive: true, roles: [] }];
      (fetch as Mock).mockReturnValue(createFetchResponse(true, mockUsers));

      const result = await apiService.getUsers();
      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/users?`, expect.any(Object));
      expect(result).toEqual(mockUsers);
    });
    it('getRoles: deve buscar a lista de perfis', async () => {
      const mockRoles = [{ id: 1, name: 'ADMIN' }];
      (fetch as Mock).mockReturnValue(createFetchResponse(true, mockRoles));
      const result = await apiService.getRoles();
      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/roles`, expect.any(Object));
      expect(result).toEqual(mockRoles);
    });
  });

  describe('createUser', () => {
    it('deve enviar os dados corretos para criar um usuário', async () => {
      const dto: CreateUserDto = { fullName: 'New User', username: 'newuser', email: 'new@user.com', password: 'password123', roleIds: [1] };
      (fetch as Mock).mockReturnValue(createFetchResponse(true, { id: 2, ...dto }, 201));

      await apiService.createUser(dto);
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/users`,
        expect.objectContaining({ method: 'POST', body: JSON.stringify(dto) })
      );
    });
  });

  describe('updateUser', () => {
    it('deve enviar uma requisição PATCH para atualizar um usuário', async () => {
      const dto: UpdateUserDto = { fullName: 'Updated Name' };
      (fetch as Mock).mockReturnValue(createFetchResponse(true, { id: 1, fullName: 'Updated Name' }));

      await apiService.updateUser(1, dto);
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/users/1`,
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify(dto) })
      );
    });
  });

  describe('softDeleteUser', () => {
    it('deve enviar uma requisição DELETE para desativar um usuário', async () => {
      (fetch as Mock).mockReturnValue(createFetchResponse(true, null, 204));

      await apiService.softDeleteUser(1);
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/users/1`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  // ===================================================================
  // SUÍTE DE TESTES: INSPECTIONS 
  // ===================================================================


  describe('getInspections', () => {
    it('deve buscar e retornar uma lista de inspeções', async () => {
      const mockData = [{ id: 1 }];
      (fetch as Mock).mockReturnValue(createFetchResponse(true, mockData));
      const result = await apiService.getInspections();

      // Usamos expect.any(Object) porque o apiFetch sempre envia um objeto de opções.
      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/inspections`, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('deve lançar um erro em caso de falha na busca', async () => {
      (fetch as Mock).mockReturnValue(createFetchResponse(false, { message: 'Falha' }, 500));
      await expect(apiService.getInspections()).rejects.toThrow('Falha');
    });
  });

  describe('getInspectionById', () => {
    it('deve buscar e retornar os detalhes de uma inspeção específica', async () => {
      const mockData = { id: 1 };
      (fetch as Mock).mockReturnValue(createFetchResponse(true, mockData));
      const result = await apiService.getInspectionById(1);

      // O apiFetch sempre envia headers
      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/inspections/1`, expect.any(Object));
      expect(result).toEqual(mockData);
    });
  });

  describe('getLookups', () => {
    it('deve buscar e retornar uma lista de lookups para um tipo', async () => {
      const mockData = [{ id: 'A' }];
      (fetch as Mock).mockReturnValue(createFetchResponse(true, mockData));
      const result = await apiService.getLookups('modalities');

      //  O apiFetch sempre envia headers.
      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/lookups/modalities`, expect.any(Object));
      expect(result).toEqual(mockData);
    });
  });

  describe('checkExistingInspection', () => {
    it('deve retornar null se a inspeção não existir (status 404)', async () => {
      const dto: CreateInspectionDto = { 
        driverName: 'Test', 
        modalityId: 1, 
        operationTypeId: 1, 
        unitTypeId: 1,
        entryRegistration: 'RE-TEST',
        vehiclePlates: 'ABC-1234',
        containerNumber: 'CNTR123456'
      };
      // Simulamos o erro 404 que será capturado pelo try/catch no serviço.
      (fetch as Mock).mockReturnValue(createFetchResponse(false, { message: 'Not Found' }, 404));
      const result = await apiService.checkExistingInspection(dto);
      expect(result).toBeNull();
    });
  });

  describe('updateInspection', () => {
    it('deve enviar uma requisição PATCH para atualizar o cabeçalho da inspeção', async () => {
      const dto: UpdateInspectionDto = { driverName: 'Novo Nome' };
      (fetch as Mock).mockReturnValue(createFetchResponse(true, {}));
      await apiService.updateInspection(1, dto);
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/inspections/1`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(dto),
        })
      );
    });
  });

  describe('deleteInspection', () => {
    it('deve enviar uma requisição DELETE para apagar uma inspeção', async () => {
      const mockResponse = { message: 'Inspeção apagada' };
      (fetch as Mock).mockReturnValue(createFetchResponse(true, mockResponse));
      const result = await apiService.deleteInspection(1);
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/inspections/1`,
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateChecklistItem', () => {
    it('deve enviar uma requisição PATCH para o endpoint correto', async () => {
      const dto: UpdateInspectionChecklistItemDto = { statusId: 2, observations: 'OK' };
      (fetch as Mock).mockReturnValue(createFetchResponse(true, { id: 1, ...dto }));
      await apiService.updateChecklistItem(1, 5, dto);
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/inspections/1/points/5`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(dto),
        }),
      );
    });
  });

  describe('uploadEvidence', () => {
    it('deve enviar um FormData com o arquivo', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      (fetch as Mock).mockReturnValue(createFetchResponse(true, { id: 1, fileName: 'test.png' }));
      await apiService.uploadEvidence(1, 3, file);
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/inspections/1/points/3/evidence`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
    });
  });

  describe('deleteEvidence', () => {
    it('deve enviar uma requisição DELETE com o fileName no corpo', async () => {
      (fetch as Mock).mockReturnValue(createFetchResponse(true, { message: 'sucesso' }));
      await apiService.deleteEvidence(1, 5, 'evidence-to-delete.png');
      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/inspections/1/points/5/evidence`,
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ fileName: 'evidence-to-delete.png' }),
        }),
      );
    });
  });

  describe('downloadReportPdf', () => {
    it('deve baixar o relatório e retornar um Blob', async () => {
      const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
      // CORREÇÃO: Usamos o helper para garantir que a resposta tenha headers.
      (fetch as Mock).mockReturnValue(createFetchResponse(true, mockBlob));
      const result = await apiService.downloadReportPdf(1);
      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/inspections/1/report/pdf`, expect.any(Object));
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('getReportHtml', () => {
    it('deve buscar o relatório HTML e retornar o conteúdo como texto', async () => {
      const mockHtml = '<html></html>';
      // CORREÇÃO: Usamos o helper.
      (fetch as Mock).mockReturnValue(createFetchResponse(true, mockHtml));
      const result = await apiService.getReportHtml(123);
      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/inspections/123/report/html`, expect.any(Object));
      expect(result).toBe(mockHtml);
    });
  });

  describe('downloadEvidence', () => {
    it('deve baixar um arquivo de evidência e retornar um Blob', async () => {
      const mockBlob = new Blob(['image-content'], { type: 'image/png' });
      // CORREÇÃO: Usamos o helper.
      (fetch as Mock).mockReturnValue(createFetchResponse(true, mockBlob));
      const result = await apiService.downloadEvidence(1, 2, 'evidence.png');
      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/inspections/1/points/2/evidence/evidence.png`, expect.any(Object));
      expect(result).toBeInstanceOf(Blob);
    });

    it('deve lançar um erro se a resposta não for bem-sucedida', async () => {
      (fetch as Mock).mockReturnValue(createFetchResponse(false, {}, 500));
      // CORREÇÃO: Ajustamos a mensagem de erro para a que o apiFetch realmente retorna.
      await expect(apiService.downloadEvidence(1, 2, 'fail.png')).rejects.toThrow('Falha na requisição para /inspections/1/points/2/evidence/fail.png');
    });
  });
});