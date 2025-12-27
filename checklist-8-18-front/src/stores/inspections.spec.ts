import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInspectionsStore } from './inspections';
import { apiService } from '@/services/apiService';
import type { Inspection, Lookup, CreateInspectionDto, User, ItemEvidence, InspectionChecklistItem, UpdateInspectionDto } from '@/models';

// Mock do apiService completo, incluindo o novo método getUsers
vi.mock('@/services/apiService', () => ({
  apiService: {
    getInspections: vi.fn(),
    getInspectionById: vi.fn(),
    getLookups: vi.fn(),
    checkExistingInspection: vi.fn(),
    createInspection: vi.fn(),
    updateChecklistItem: vi.fn(),
    uploadEvidence: vi.fn(),
    deleteEvidence: vi.fn(),
    finalizeInspection: vi.fn(),
    downloadReportPdf: vi.fn(),
    updateInspection: vi.fn(),
    deleteInspection: vi.fn(),
    getReportHtml: vi.fn(),
    downloadEvidence: vi.fn(),
    getUsers: vi.fn(), // <-- Adicionado o mock para o novo método
  },
}));

// Helper ajustado para a nova estrutura de Inspection
const createMockInspection = (id: number, statusName: string): Inspection => ({
  id,
  createdAt: new Date().toISOString(),
  startDatetime: new Date().toISOString(),
  inspectorId: 10,
  inspector: { id: 10, fullName: 'Inspetor Teste', username: 'teste', email: 'a@a.com', isActive: true, roles: [] },
  driverName: 'Motorista Teste',
  status: { id: 1, name: statusName },
  modality: { id: 1, name: 'Rodoviário' },
  operationType: { id: 1, name: 'Importação' },
  unitType: { id: 1, name: 'Contêiner' },
  containerType: { id: 1, name: 'DRY_20' },
  items: [],
  // Adicione outras propriedades obrigatórias da sua interface Inspection se necessário
} as any);


describe('Inspections Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
  });


  it('deve buscar e armazenar a lista de inspeções', async () => {
    const store = useInspectionsStore();
    const mockInspections = [createMockInspection(1, 'EM_INSPECAO')];
    (apiService.getInspections as Mock).mockResolvedValue(mockInspections);

    await store.fetchInspections();

    expect(apiService.getInspections).toHaveBeenCalledTimes(1);
    expect(store.inspections).toEqual(mockInspections);
  });

  it('deve buscar e armazenar os dados de lookup para o formulário', async () => {
    const store = useInspectionsStore();
    const mockModalities: Lookup[] = [{ id: 1, name: 'RODOVIARIO' }];
    (apiService.getLookups as Mock).mockResolvedValue(mockModalities);

    await store.fetchFormLookups();

    expect(apiService.getLookups).toHaveBeenCalledWith('modalities');
    expect(store.modalities).toEqual(mockModalities);
  });

  it('deve buscar uma inspeção por ID e armazená-la como a inspeção atual', async () => {
    const store = useInspectionsStore();
    const mockInspection = createMockInspection(123, 'EM_INSPECAO');
    (apiService.getInspectionById as Mock).mockResolvedValue(mockInspection);

    await store.fetchInspectionById(123);

    expect(apiService.getInspectionById).toHaveBeenCalledWith(123);
    expect(store.currentInspection).toEqual(mockInspection);
  });

  describe('createInspection', () => {
    it('deve ser chamado com inspectorId em vez de inspectorName', async () => {
      const store = useInspectionsStore();
      const dto: CreateInspectionDto = { 
        driverName: 'Test', 
        modalityId: 1, 
        operationTypeId: 1, 
        unitTypeId: 1,
        entryRegistration: 'RE-TEST',
        vehiclePlates: 'ABC-1234',
        containerNumber: 'CNTR123456'
      };
      const newInspection = createMockInspection(1, 'EM_INSPECAO');
      (apiService.checkExistingInspection as Mock).mockResolvedValue(null);
      (apiService.createInspection as Mock).mockResolvedValue(newInspection);

      await store.createInspection(dto);

      expect(apiService.createInspection).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteEvidence', () => {
    it('deve chamar o apiService.deleteEvidence e remover a evidência do estado local', async () => {
      const store = useInspectionsStore();
      const mockEvidence: ItemEvidence = { id: 101, itemId: 1, fileName: 'test.png', filePath: '', fileSize: 1, mimeType: '' };
      const mockItem: InspectionChecklistItem = { id: 1, inspectionId: 1, masterPointId: 1, statusId: 1, evidences: [mockEvidence], createdAt: '', updatedAt: '', status: { id: 1, name: '' }, masterPoint: { id: 1, pointNumber: 1, name: '', description: '' } };
      store.currentInspection = createMockInspection(1, 'EM_INSPECAO');
      store.currentInspection.items = [mockItem];

      (apiService.deleteEvidence as Mock).mockResolvedValue(undefined);

      await store.deleteEvidence(mockItem, mockEvidence);

      expect(apiService.deleteEvidence).toHaveBeenCalledWith(1, 1, 'test.png');
      expect(store.currentInspection?.items[0].evidences).toHaveLength(0);
    });

    it('deve tratar o erro se a chamada da API falhar', async () => {
      const store = useInspectionsStore();
      const mockEvidence: ItemEvidence = { id: 101, itemId: 1, fileName: 'test.png', filePath: '', fileSize: 1, mimeType: '' };
      const mockItem: InspectionChecklistItem = { id: 1, inspectionId: 1, masterPointId: 1, statusId: 1, evidences: [mockEvidence], createdAt: '', updatedAt: '', status: { id: 1, name: '' }, masterPoint: { id: 1, pointNumber: 1, name: '', description: '' } };
      store.currentInspection = createMockInspection(1, 'EM_INSPECAO');
      store.currentInspection.items = [mockItem];

      (apiService.deleteEvidence as Mock).mockRejectedValue(new Error('Falha na API'));

      await store.deleteEvidence(mockItem, mockEvidence);

      expect(store.currentInspection?.items[0].evidences).toHaveLength(1);
      expect(store.error).toContain('Falha na API');
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('downloadReportPdf', () => {
    it('deve chamar o apiService e retornar um Blob', async () => {
      const store = useInspectionsStore();
      const mockBlob = new Blob(['pdf-content']);
      (apiService.downloadReportPdf as Mock).mockResolvedValue(mockBlob);

      const result = await store.downloadReportPdf(123);

      expect(apiService.downloadReportPdf).toHaveBeenCalledWith(123);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('fetchReportHtml', () => {
    it('deve chamar apiService.getReportHtml e armazenar o resultado em currentReportHtml', async () => {
      const store = useInspectionsStore();
      const inspectionId = 123;
      const mockHtml = '<h1>Relatório Teste</h1>';
      (apiService.getReportHtml as Mock).mockResolvedValue(mockHtml);

      await store.fetchReportHtml(inspectionId);

      expect(apiService.getReportHtml).toHaveBeenCalledWith(inspectionId);
      expect(store.currentReportHtml).toBe(mockHtml);
      expect(store.error).toBeNull();
      expect(store.isLoading).toBe(false);
    });

    it('deve armazenar uma mensagem de erro se a chamada da API falhar', async () => {
      const store = useInspectionsStore();
      const inspectionId = 404;
      const errorMessage = 'Relatório não encontrado';
      (apiService.getReportHtml as Mock).mockRejectedValue(new Error(errorMessage));

      await store.fetchReportHtml(inspectionId);

      expect(store.error).toBe(errorMessage);
      expect(store.currentReportHtml).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('updateInspection', () => {
    it('deve chamar o apiService e recarregar os dados da inspeção', async () => {
      const store = useInspectionsStore();
      const dto: UpdateInspectionDto = { driverName: 'Novo Piloto' };
      const updatedInspection = createMockInspection(1, 'EM_INSPECAO');
      updatedInspection.driverName = 'Novo Piloto';

      (apiService.updateInspection as Mock).mockResolvedValue(undefined);
      (apiService.getInspectionById as Mock).mockResolvedValue(updatedInspection);

      await store.updateInspection(1, dto);

      expect(apiService.updateInspection).toHaveBeenCalledWith(1, dto);
      expect(apiService.getInspectionById).toHaveBeenCalledWith(1);
      expect(store.currentInspection?.driverName).toBe('Novo Piloto');
    });
  });

  describe('deleteInspection', () => {
    it('deve chamar o apiService e remover a inspeção da lista local', async () => {
      const store = useInspectionsStore();
      store.inspections = [createMockInspection(1, 'A'), createMockInspection(2, 'B')];
      (apiService.deleteInspection as Mock).mockResolvedValue({ message: 'Apagado' });

      await store.deleteInspection(1);

      expect(apiService.deleteInspection).toHaveBeenCalledWith(1);
      expect(store.inspections).toHaveLength(1);
      expect(store.inspections[0].id).toBe(2);
    });
  });

  describe('fetchSealVerificationStatuses', () => {
    it('deve buscar e armazenar os status de verificação de lacre', async () => {
      const store = useInspectionsStore();
      const mockStatuses: Lookup[] = [{ id: 1, name: 'OK' }];
      (apiService.getLookups as Mock).mockResolvedValue(mockStatuses);

      await store.fetchSealVerificationStatuses();

      expect(apiService.getLookups).toHaveBeenCalledWith('seal-verification-statuses');
      expect(store.sealVerificationStatuses).toEqual(mockStatuses);
    });

    it('não deve buscar os status se eles já estiverem carregados', async () => {
      const store = useInspectionsStore();
      store.sealVerificationStatuses = [{ id: 1, name: 'OK' }];

      await store.fetchSealVerificationStatuses();

      expect(apiService.getLookups).not.toHaveBeenCalled();
    });
  });

  describe('downloadEvidence', () => {
    const mockEvidence: ItemEvidence = { id: 101, itemId: 1, fileName: 'test.png', filePath: '', fileSize: 1, mimeType: '' };
    const mockItem: InspectionChecklistItem = { id: 1, inspectionId: 1, masterPointId: 1, statusId: 1, evidences: [mockEvidence], createdAt: '', updatedAt: '', status: { id: 1, name: '' }, masterPoint: { id: 1, pointNumber: 1, name: '', description: '' } };

    it('deve chamar apiService.downloadEvidence com os parâmetros corretos em caso de sucesso', async () => {
      const store = useInspectionsStore();
      store.currentInspection = createMockInspection(123, 'EM_INSPECAO');
      store.currentInspection.items = [mockItem];

      const mockBlob = new Blob(['image-content']);
      (apiService.downloadEvidence as Mock).mockResolvedValue(mockBlob);

      window.URL.createObjectURL = vi.fn(() => 'blob:url');
      window.URL.revokeObjectURL = vi.fn();

      const fakeLink = { click: vi.fn(), setAttribute: vi.fn(), style: { display: '' } };
      document.createElement = vi.fn(() => fakeLink as any);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      await store.downloadEvidence(mockItem, mockEvidence);

      expect(apiService.downloadEvidence).toHaveBeenCalledWith(123, 1, 'test.png');
      expect(store.isSubmitting).toBe(false);
      expect(store.error).toBeNull();
    });

    it('deve definir uma mensagem de erro se o download da evidência falhar', async () => {
      const store = useInspectionsStore();
      store.currentInspection = createMockInspection(123, 'EM_INSPECAO');
      store.currentInspection.items = [mockItem];

      const errorMessage = 'Arquivo não encontrado';
      (apiService.downloadEvidence as Mock).mockRejectedValue(new Error(errorMessage));

      await store.downloadEvidence(mockItem, mockEvidence);

      expect(store.error).toBe(errorMessage);
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining(errorMessage));
      expect(store.isSubmitting).toBe(false);
    });
  });

  describe('fetchInspectors', () => {
    it('deve chamar apiService.getUsers com o filtro de role e armazenar o resultado', async () => {
      const store = useInspectionsStore();
      const mockInspectors: User[] = [{ id: 1, fullName: 'Inspetor 1', username: 'insp1', email: 'a@a.com', isActive: true, roles: [] }];
      (apiService.getUsers as Mock).mockResolvedValue(mockInspectors);

      await store.fetchInspectors();

      expect(apiService.getUsers).toHaveBeenCalledWith({ role: 'INSPECTOR' });
      expect(store.inspectors).toEqual(mockInspectors);
      expect(store.isLoading).toBe(false);
    });

    it('não deve buscar os inspetores se eles já estiverem carregados', async () => {
      const store = useInspectionsStore();
      store.inspectors = [{ id: 1, fullName: 'Inspetor 1', username: 'insp1', email: 'a@a.com', isActive: true, roles: [] }];

      await store.fetchInspectors();

      expect(apiService.getUsers).not.toHaveBeenCalled();
    });
  });

  describe('fetchFormLookups', () => {
    it('deve buscar todos os dados de lookup, incluindo os inspetores', async () => {
        const store = useInspectionsStore();
        const mockModalities: Lookup[] = [{ id: 1, name: 'RODOVIARIO' }];
        const mockInspectors: User[] = [{ id: 1, fullName: 'Inspetor 1', username:'insp1', email:'a@a.com', isActive: true, roles:[] }];
        
        // Mock das chamadas que serão feitas
        (apiService.getLookups as Mock).mockResolvedValue(mockModalities);
        (apiService.getUsers as Mock).mockResolvedValue(mockInspectors);

        await store.fetchFormLookups();
        
        // Verificamos se tanto getLookups quanto getUsers (via fetchInspectors) foram chamados
        expect(apiService.getLookups).toHaveBeenCalled();
        expect(apiService.getUsers).toHaveBeenCalledWith({ role: 'INSPECTOR' });
        expect(store.modalities).toEqual(mockModalities);
        expect(store.inspectors).toEqual(mockInspectors);
    });
  });

});
