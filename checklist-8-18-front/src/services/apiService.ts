import type {
  Inspection,
  CreateInspectionDto,
  Lookup,
  InspectionChecklistItem,
  ItemEvidence,
  UpdateInspectionChecklistItemDto,
  UpdateInspectionDto,
  LoginCredentials,
  LoginResponse,
  ChangePasswordDto,
  User,
  CreateUserDto,
  UpdateUserDto,
  ResetPasswordDto,
  FinalizeInspectionDto,
  AttachDriverSignatureDto,
  SealInitialDto,
  UpdateSealDto,
  UpdateInspectionImageDto,
  FinalizeConferenceDto,
  OverrideInspectionDto,
  RfbSealDto,
  GateQueueItem,
  AttachSignaturesDto
} from '@/models';

function getApiBaseUrl(): string {
  // Em PRODUÇÃO (build), ele vai procurar pelo config.js
  if (import.meta.env.PROD) {
    return window.runtimeConfig.VITE_API_BASE_URL;
  }

  // Em DEV ou TESTES, ele vai procurar pelo .env
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888/api';
}

/**
 * Função auxiliar que centraliza a lógica de chamada de API.
 * Ela automaticamente adiciona o token de autenticação, lida com
 * erros comuns e os headers.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Inicializa o headers a partir das opções, se existirem
  const headers = new Headers(options.headers);

  // A lógica do Content-Type  é condicional.
  // Só adicionamos 'application/json' se o body NÃO for FormData.
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  // Se for FormData, deixamos o navegador definir o Content-Type com o boundary correto.

  if ((window as any).Cypress) {
    headers.set('X-Cypress-Request', 'true');
  }

  const token = localStorage.getItem('authToken');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `${response.status}: ${errorData.message ?? `Falha na requisição para ${endpoint}`
        }`
      );
    }

    if (response.status === 204) return null as T;

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) return await response.json();
    if (contentType?.includes('text/html')) return (await response.text()) as T;
    return (await response.blob()) as T;

  } catch (error) {
    console.error(`Erro em apiFetch(${endpoint}):`, error);
    throw error;
  }
}

const BASE_URL = getApiBaseUrl();

export const apiService = {
  // ===================================================================
  // AUTH & USERS API
  // ===================================================================

  /**
   * Autentica um usuário.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Permite ao usuário logado alterar a própria senha.
   */
  async changeMyPassword(data: ChangePasswordDto): Promise<void> {
    await apiFetch<void>('/auth/change-my-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Lista todos os usuários, com filtros opcionais.
   */
  async getUsers(filters?: { role?: string; name?: string }): Promise<User[]> {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    return apiFetch<User[]>(`/users?${query}`);
  },

  /**
   * Busca um usuário específico por ID.
   */
  async getUserById(id: number): Promise<User> {
    return apiFetch<User>(`/users/${id}`);
  },

  /**
   * Cria um novo usuário.
   */
  async createUser(data: CreateUserDto): Promise<User> {
    return apiFetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza os dados de um usuário.
   */
  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    return apiFetch<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Redefine a senha de um usuário.
   */
  async resetPassword(id: number, data: ResetPasswordDto): Promise<void> {
    await apiFetch<void>(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Desativa (soft delete) um usuário.
   */
  async softDeleteUser(id: number): Promise<void> {
    await apiFetch<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // ===================================================================
  // INSPECTIONS API
  // ===================================================================

  /**
   * Busca a lista de todas as inspeções.
   */
  async getInspections(): Promise<Inspection[]> {
    return apiFetch<Inspection[]>('/inspections');
  },
  /**
   * Permite ao inspetor logado assumir uma inspeção.
   * O backend associará o usuário autenticado à inspeção.
   */
  async assignInspection(id: number): Promise<Inspection> {
    return apiFetch<Inspection>(`/inspections/${id}/assign`, {
      method: 'PATCH',
    });
  },
  /**
   * Busca os detalhes completos de uma única inspeção pelo ID.
   */
  async getInspectionById(id: number): Promise<Inspection> {
    return apiFetch<Inspection>(`/inspections/${id}`);
  },

  /**
   * Busca dados de uma tabela de lookup específica (ex: 'modalities').
   */
  async getLookups(type: string): Promise<Lookup[]> {
    return apiFetch<Lookup[]>(`/lookups/${type}`);
  },

  /**
   * Busca a lista de todos os perfis (roles) disponíveis.
   */
  async getRoles(): Promise<Lookup[]> {
    return apiFetch<Lookup[]>(`/roles`);
  },

  /**
   * Envia os dados do formulário para criar uma nova inspeção.
   */
  async createInspection(data: CreateInspectionDto): Promise<Inspection> {
    return apiFetch<Inspection>('/inspections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Verifica se uma inspeção similar já existe.
   */
  async checkExistingInspection(data: CreateInspectionDto): Promise<Inspection | null> {
    // Tratamento especial para o status 404, que não é um erro neste caso
    try {
      return await apiFetch<Inspection>('/inspections/check-existing', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      if ((error as Error).message.includes('404')) return null;
      throw error;
    }
  },

  /**
   * Atualiza os dados do cabeçalho de uma inspeção.
   */
  async updateInspection(id: number, data: UpdateInspectionDto): Promise<void> {
    await apiFetch<void>(`/inspections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Apaga uma inspeção completa.
   */
  async deleteInspection(id: number): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/inspections/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Atualiza um item específico do checklist.
   */
  async updateChecklistItem(
    inspectionId: number,
    pointNumber: number,
    data: UpdateInspectionChecklistItemDto
  ): Promise<InspectionChecklistItem> {
    return apiFetch<InspectionChecklistItem>(`/inspections/${inspectionId}/points/${pointNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Envia um arquivo de evidência.
   */
  async uploadEvidence(inspectionId: number, pointNumber: number, file: File): Promise<ItemEvidence> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return apiFetch<ItemEvidence>(
      `/inspections/${inspectionId}/points/${pointNumber}/evidence`, {
      method: 'POST',
      body: formData,
    }
      // Não precisamos mais passar headers aqui
    );
  },


  /**
   * Apaga uma evidência específica.
   */
  async deleteEvidence(inspectionId: number, pointNumber: number, fileName: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/inspections/${inspectionId}/points/${pointNumber}/evidence`, {
      method: 'DELETE',
      body: JSON.stringify({ fileName }),
    });
  },

  /**
   * Finaliza uma inspeção, enviando número do lacre e fotos obrigatórias.
   */
  async finalizeInspection(
    id: number,
    dto: FinalizeInspectionDto,
    files: {
      sealPhoto: File,
      platePhoto: File
    }
  ): Promise<Inspection> {
    const formData = new FormData();

    // Adiciona os dados do DTO (número do lacre)
    formData.append('sealUagaPostInspection', dto.sealUagaPostInspection);

    // --- INÍCIO DA CORREÇÃO ---
    // Adiciona os arquivos de foto, especificando o NOME DO ARQUIVO.
    // Isso garante que o backend (Multer) processe os arquivos corretamente.
    if (files.sealPhoto) {
      formData.append('sealPhoto', files.sealPhoto, files.sealPhoto.name);
    }
    if (files.platePhoto) {
      formData.append('platePhoto', files.platePhoto, files.platePhoto.name);
    }
    // --- FIM DA CORREÇÃO ---

    return apiFetch<Inspection>(`/inspections/${id}/finalize`, {
      method: 'PATCH',
      body: formData, // O apiFetch já sabe como lidar com FormData
    });
  },

  /**
   * Baixa o relatório em PDF.
   */
  async downloadReportPdf(id: number): Promise<Blob> {
    return apiFetch<Blob>(`/inspections/${id}/report/pdf`);
  },

  /**
   * Busca a versão HTML do relatório para pré-visualização.
   */
  async getReportHtml(id: number): Promise<string> {
    return apiFetch<string>(`/inspections/${id}/report/html`);
  },

  /**
   * Baixa um arquivo de evidência específico.
   */
  async downloadEvidence(inspectionId: number, pointNumber: number, fileName: string): Promise<Blob> {
    return apiFetch<Blob>(`/inspections/${inspectionId}/points/${pointNumber}/evidence/${fileName}`);
  },
  /**
   * Anexa as assinaturas (como arquivos) a uma inspeção.
   */
  async attachSignatures(
    inspectionId: number,
    dto: AttachSignaturesDto,
    files: {
      inspectorSignature?: File,
      driverSignature?: File
    }
  ): Promise<Inspection> {
    const formData = new FormData();

    // Adiciona o DTO ao FormData
    // Converte o booleano para string 'true'/'false' para o FormData
    formData.append('useProfileSignature', String(dto.useProfileSignature || false));

    // Adiciona os arquivos de assinatura (se existirem)
    if (files.inspectorSignature) {
      formData.append('inspectorSignature', files.inspectorSignature, 'inspector-signature.png');
    }
    if (files.driverSignature) {
      formData.append('driverSignature', files.driverSignature, 'driver-signature.png');
    }
    // TODO: Adicionar 'checkerSignature' (assinatura do conferente) aqui quando a TASK-08 for implementada

    return apiFetch<Inspection>(`/inspections/${inspectionId}/signatures`, {
      method: 'POST',
      body: formData,
    });
  },
  /**
   * Anexa a assinatura do motorista (via base64) a uma inspeção.
   */
  async attachDriverSignature(
    inspectionId: number,
    dto: AttachDriverSignatureDto
  ): Promise<Inspection> {
    return apiFetch<Inspection>(`/inspections/${inspectionId}/driver-signature`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Envia múltiplos lacres e fotos de uma vez (Task 13.1).
   */
  async sealInitial(
    id: number,
    dto: SealInitialDto,
    files: {
      sealPhotos: File[],
      platePhotos: File[]
    }
  ): Promise<Inspection> {
    const formData = new FormData();

    // Adiciona os números dos lacres (repetindo a chave para array)
    dto.sealNumbers.forEach((number) => {
      formData.append('sealNumbers', number);
    });

    // Adiciona as fotos dos lacres (com nome explícito)
    files.sealPhotos.forEach((file) => {
      formData.append('sealPhotos', file, file.name);
    });

    // Adiciona as fotos das placas (com nome explícito)
    files.platePhotos.forEach((file) => {
      formData.append('platePhotos', file, file.name);
    });

    return apiFetch<Inspection>(`/inspections/${id}/seal-initial`, {
      method: 'PATCH',
      body: formData,
    });
  },

  /**
   * Edita um lacre específico.
   */
  async updateSeal(
    inspectionId: number,
    sealId: number,
    dto: UpdateSealDto,
    file?: File
  ): Promise<void> {
    const formData = new FormData();
    if (dto.sealNumber) formData.append('sealNumber', dto.sealNumber);
    if (file) formData.append('photo', file, file.name);

    await apiFetch<void>(`/inspections/${inspectionId}/seals/${sealId}`, {
      method: 'PATCH',
      body: formData,
    });
  },

  /**
   * Deleta um lacre específico.
   */
  async deleteSeal(inspectionId: number, sealId: number): Promise<void> {
    await apiFetch<void>(`/inspections/${inspectionId}/seals/${sealId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Edita uma imagem de placa/container.
   */
  async updateInspectionImage(
    inspectionId: number,
    imageId: number,
    dto: UpdateInspectionImageDto,
    file?: File
  ): Promise<void> {
    const formData = new FormData();
    if (dto.description) formData.append('description', dto.description);
    if (file) formData.append('photo', file, file.name);

    await apiFetch<void>(`/inspections/${inspectionId}/images/${imageId}`, {
      method: 'PATCH',
      body: formData,
    });
  },

  // ===================================================================
  // [NOVO] NOVAS ROTAS - FLUXO DO CONFERENTE
  // ===================================================================

  /**
   * Inicia o carregamento (Check-in).
   */
  async startLoading(id: number): Promise<Inspection> {
    return apiFetch<Inspection>(`/inspections/${id}/start-loading`, {
      method: 'PATCH',
    });
  },

  /**
   * 2.2: Finaliza a conferência (Relacre e Saída).
   */
  async finalizeConference(
    id: number,
    dto: FinalizeConferenceDto,
    files: {
      finalSealPhotos: File[],
      panoramicPhotos: File[]
    }
  ): Promise<Inspection> {
    const formData = new FormData();

    // [CORREÇÃO CRÍTICA]
    // Converte explicitamente para string 'true' ou 'false'
    // Isso evita undefined ou conversões erradas
    const precintoString = dto.hasPrecinto ? 'true' : 'false';
    formData.append('hasPrecinto', precintoString);

    // DEBUG: Verifique isso no console do navegador (F12)
    console.log('📡 [ApiService] Enviando hasPrecinto:', precintoString);

    // Arrays de texto
    dto.finalSealNumbers.forEach(num => {
      formData.append('finalSealNumbers', num);
    });

    // Fotos dos lacres
    files.finalSealPhotos.forEach(file => {
      formData.append('finalSealPhotos', file, file.name);
    });

    // Fotos panorâmicas
    files.panoramicPhotos.forEach(file => {
      formData.append('panoramicPhotos', file, file.name);
    });

    return apiFetch<Inspection>(`/inspections/${id}/finish-loading`, {
      method: 'POST',
      body: formData,
    });
  },
  // ===================================================================
  // [NOVO] NOVAS ROTAS - FLUXO DOCUMENTAL (ADMINISTRATIVO)
  // ===================================================================

  /**
   * Aprovação de exceção (Override).
   */
  async overrideApproval(id: number, dto: OverrideInspectionDto): Promise<Inspection> {
    return apiFetch<Inspection>(`/inspections/${id}/override-approval`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async registerRfbSeal(
    id: number,
    data: RfbSealDto,
    // Objeto de arquivos tipado conforme a regra condicional
    files: {
      rfbPhoto: File;
      armadorPhoto?: File;
      // Precinto (Cenário 1)
      precintoFront?: File;
      precintoRear?: File;
      precintoLeft?: File;
      precintoRight?: File;
      // Sem Precinto (Cenário 2)
      noPrecintoPhoto?: File;
    }
  ): Promise<void> {
    const formData = new FormData();

    // 1. Campos Comuns
    formData.append('rfbSealNumber', data.rfbSealNumber);

    // Nota: hasPrecinto NÃO é enviado aqui, o backend lê do banco.
    if (data.armadorSealNumber) {
      formData.append('armadorSealNumber', data.armadorSealNumber);
    }

    // 2. Arquivos Comuns
    formData.append('rfbPhoto', files.rfbPhoto);

    if (files.armadorPhoto) {
      formData.append('armadorPhoto', files.armadorPhoto);
    }

    // 3. Lógica Condicional de Arquivos (Conforme Guia TASK-RFB-03)
    // O Frontend manda o que tiver preenchido, o Backend valida se bate com a regra.

    // Cenário 1: Com Precinto
    if (files.precintoFront) formData.append('precintoFront', files.precintoFront);
    if (files.precintoRear) formData.append('precintoRear', files.precintoRear);
    if (files.precintoLeft) formData.append('precintoLeft', files.precintoLeft);
    if (files.precintoRight) formData.append('precintoRight', files.precintoRight);

    // Cenário 2: Sem Precinto
    if (files.noPrecintoPhoto) {
      formData.append('noPrecintoPhoto', files.noPrecintoPhoto);
    }

    await apiFetch<void>(`/inspections/${id}/rfb-seal`, {
      method: 'POST',
      body: formData,
    });
  },
  /**
   * Busca a fila de veículos aguardando saída (Status 13).
   */
  async getGateQueue(): Promise<GateQueueItem[]> {
    return apiFetch<GateQueueItem[]>('/gate/queue');
  },
  /**
   * Registra a saída física do veículo (Gate Out).
   * Endpoint: POST /gate/exit/:id
   * Payload: RegisterGateExitDto
   */
  async registerExit(
    inspectionId: number, 
    data: { 
      sealVerificationRfbStatusId?: number; 
      sealVerificationShipperStatusId?: number; 
    }
  ): Promise<void> {
    // Agora enviamos o JSON no corpo da requisição
    await apiFetch<void>(`/gate/exit/${inspectionId}`, {
      method: 'POST',
      body: JSON.stringify(data) 
    });
  },
};