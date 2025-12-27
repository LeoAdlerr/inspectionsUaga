import { defineStore } from 'pinia';
import { apiService } from '@/services/apiService';
import type {
  Inspection, CreateInspectionDto, Lookup, UpdateInspectionChecklistItemDto,
  InspectionChecklistItem, ItemEvidence, UpdateInspectionDto, User,
  FinalizeInspectionDto, SealInitialDto,
  UpdateSealDto,
  UpdateInspectionImageDto,
  FinalizeConferenceDto,
  OverrideInspectionDto,
  RfbSealDto, AttachSignaturesDto, AttachDriverSignatureDto,
  GateQueueItem
} from '@/models';

async function base64ToFile(
  base64: string,
  filename: string,
  mimeType: string = 'image/png'
): Promise<File> {
  const res = await fetch(base64);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
}

interface InspectionsState {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  modalities: Lookup[];
  operationTypes: Lookup[];
  unitTypes: Lookup[];
  containerTypes: Lookup[];
  sealVerificationStatuses: Lookup[];
  inspectors: User[];
  roles: Lookup[];
  currentReportHtml: string | null;
  gateQueue: GateQueueItem[];
}

export const useInspectionsStore = defineStore('inspections', {
  state: (): InspectionsState => ({
    inspections: [],
    currentInspection: null,
    isLoading: false,
    isSubmitting: false,
    currentReportHtml: null,
    error: null,
    modalities: [],
    operationTypes: [],
    unitTypes: [],
    containerTypes: [],
    sealVerificationStatuses: [],
    inspectors: [],
    roles: [],
    gateQueue: [],
  }),

  actions: {
    async fetchInspectors() {
      if (this.inspectors.length > 0) return;
      this.isLoading = true;
      this.error = null;
      try {
        this.inspectors = await apiService.getUsers({ role: 'INSPECTOR' });
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchInspections() {
      this.isLoading = true;
      this.error = null;
      try {
        this.inspections = await apiService.getInspections();
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchRoles() {
      if (this.roles.length > 0) return;
      this.isLoading = true;
      try {
        this.roles = await apiService.getRoles();
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchFormLookups() {
      this.isLoading = true;
      try {
        await Promise.all([
          apiService.getLookups('modalities').then(data => this.modalities = data),
          apiService.getLookups('operation-types').then(data => this.operationTypes = data),
          apiService.getLookups('unit-types').then(data => this.unitTypes = data),
          apiService.getLookups('container-types').then(data => this.containerTypes = data),
          this.fetchInspectors(),
          this.fetchRoles(),
        ]);
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchInspectionById(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentInspection = await apiService.getInspectionById(id);
      } catch (err) {
        this.error = (err as Error).message;
        this.currentInspection = null;
      } finally {
        this.isLoading = false;
      }
    },

    async createInspection(data: CreateInspectionDto): Promise<Inspection | undefined> {
      this.isLoading = true;
      this.error = null;
      try {
        const existingInspection = await apiService.checkExistingInspection(data);

        if (existingInspection) {
          const formattedDate = new Date(existingInspection.createdAt).toLocaleString('pt-BR');
          const proceed = confirm(
            `Atenção: Já existe uma inspeção em andamento com dados similares (ID: ${existingInspection.id}), criada em ${formattedDate}.\n\nDeseja criar uma nova inspeção mesmo assim?`
          );
          if (!proceed) {
            return undefined;
          }
        }

        const newInspection = await apiService.createInspection(data);
        return newInspection;

      } catch (err) {
        this.error = (err as Error).message;
        alert(this.error);
        return undefined;
      } finally {
        this.isLoading = false;
      }
    },

    async updateChecklistItem(pointNumber: number, data: UpdateInspectionChecklistItemDto) {
      if (!this.currentInspection) return;
      this.isSubmitting = true;
      this.error = null;
      try {
        const updatedItem = await apiService.updateChecklistItem(this.currentInspection.id, pointNumber, data);
        const itemIndex = this.currentInspection.items.findIndex(i => i.masterPointId === pointNumber);
        if (itemIndex !== -1) {
          this.currentInspection.items[itemIndex] = { ...this.currentInspection.items[itemIndex], ...updatedItem };
        }
      } catch (err) {
        this.error = (err as Error).message;
        alert(this.error);
      } finally {
        this.isSubmitting = false;
      }
    },

    async uploadEvidence(masterPointId: number, file: File) {
      if (!this.currentInspection) {
        throw new Error('No current inspection selected');
      }
      this.isSubmitting = true;
      this.error = null;
      try {
        const newEvidence = await apiService.uploadEvidence(
          this.currentInspection.id,
          masterPointId,
          file
        );
        const itemIndex = this.currentInspection.items.findIndex(
          p => p.masterPointId === masterPointId
        );
        if (itemIndex > -1) {
          const updatedItem = { ...this.currentInspection.items[itemIndex] };
          updatedItem.evidences = updatedItem.evidences || [];
          updatedItem.evidences.push(newEvidence);
          this.currentInspection.items[itemIndex] = updatedItem;
        }
        return newEvidence;
      } catch (error) {
        console.error('Evidence upload failed:', error);
        this.error = `Falha ao enviar evidência: ${(error as Error).message}`;
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    async deleteEvidence(item: InspectionChecklistItem, evidence: ItemEvidence) {
      if (!this.currentInspection) return;
      this.isSubmitting = true;
      this.error = null;
      try {
        await apiService.deleteEvidence(this.currentInspection.id, item.masterPointId, evidence.fileName);
        const itemInStore = this.currentInspection.items.find(i => i.id === item.id);
        if (itemInStore) {
          const evidenceIndex = itemInStore.evidences.findIndex(e => e.id === evidence.id);
          if (evidenceIndex !== -1) {
            itemInStore.evidences.splice(evidenceIndex, 1);
          }
        }
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao apagar evidência: ${this.error}`);
      } finally {
        this.isSubmitting = false;
      }
    },

    async attachInspectorSignature(inspectionId: number, signatureBase64: string) {
      this.isSubmitting = true;
      this.error = null;
      try {
        const signatureFile = await base64ToFile(
          signatureBase64,
          `inspector-signature-${inspectionId}.png`
        );
        const dto: AttachSignaturesDto = { useProfileSignature: false };
        const files = { inspectorSignature: signatureFile };
        const updatedInspection = await apiService.attachSignatures(inspectionId, dto, files);
        if (this.currentInspection && this.currentInspection.id === inspectionId) {
          this.currentInspection = updatedInspection;
        }
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    async attachDriverSignature(inspectionId: number, signatureBase64: string) {
      this.isSubmitting = true;
      this.error = null;
      try {
        const dto: AttachDriverSignatureDto = { driverSignature: signatureBase64 };
        const updatedInspection = await apiService.attachDriverSignature(inspectionId, dto);
        if (this.currentInspection && this.currentInspection.id === inspectionId) {
          this.currentInspection = updatedInspection;
        }
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    async finalizeInspectionWithPhotos(
      inspectionId: number,
      finalizeDto: FinalizeInspectionDto,
      finalizeFiles: { sealPhoto: File, platePhoto: File }
    ): Promise<Inspection> {
      this.isSubmitting = true;
      this.error = null;
      try {
        const finalizedInspection = await apiService.finalizeInspection(
          inspectionId,
          finalizeDto,
          finalizeFiles
        );
        // Não atualizamos o currentInspection aqui para evitar race condition na UI
        return finalizedInspection;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    async downloadReportPdf(id: number): Promise<Blob | undefined> {
      this.isLoading = true;
      this.error = null;
      try {
        return await apiService.downloadReportPdf(id);
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao baixar o relatório: ${this.error}`);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchReportHtml(id: number) {
      this.isLoading = true;
      this.error = null;
      this.currentReportHtml = null;
      try {
        this.currentReportHtml = await apiService.getReportHtml(id);
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao carregar a pré-visualização do relatório: ${this.error}`);
      } finally {
        this.isLoading = false;
      }
    },

    async updateInspection(id: number, data: UpdateInspectionDto) {
      this.isSubmitting = true;
      this.error = null;
      try {
        await apiService.updateInspection(id, data);
        // O updateInspection genérico busca todos os dados novamente, então é seguro
        await this.fetchInspectionById(id);
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao atualizar a inspeção: ${this.error}`);
      } finally {
        this.isSubmitting = false;
      }
    },

    async deleteInspection(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await apiService.deleteInspection(id);
        this.inspections = this.inspections.filter(i => i.id !== id);
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao apagar a inspeção: ${this.error}`);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSealVerificationStatuses() {
      if (this.sealVerificationStatuses.length > 0) return;
      this.isLoading = true;
      try {
        this.sealVerificationStatuses = await apiService.getLookups('seal-verification-statuses');
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.isLoading = false;
      }
    },

    async assignInspection(id: number) {
      this.isSubmitting = true;
      this.error = null;
      try {
        const updatedInspection = await apiService.assignInspection(id);
        const index = this.inspections.findIndex(i => i.id === id);
        if (index !== -1) {
          this.inspections[index] = updatedInspection;
        }
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao assumir a inspeção: ${this.error}`);
      } finally {
        this.isSubmitting = false;
      }
    },

    async downloadEvidence(item: InspectionChecklistItem, evidence: ItemEvidence) {
      if (!this.currentInspection) return;
      this.isSubmitting = true;
      this.error = null;
      try {
        const blob = await apiService.downloadEvidence(
          this.currentInspection.id,
          item.masterPointId,
          evidence.fileName
        );
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', evidence.fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao baixar a evidência: ${this.error}`);
      } finally {
        this.isSubmitting = false;
      }
    },

    findNextPendingPoint(currentPointNumber: number): InspectionChecklistItem | null {
      if (!this.currentInspection?.items?.length) {
        return null;
      }
      const sortedItems = [...this.currentInspection.items].sort((a, b) =>
        a.masterPoint.pointNumber - b.masterPoint.pointNumber
      );
      const currentIndex = sortedItems.findIndex(item =>
        item.masterPoint.pointNumber === currentPointNumber
      );
      if (currentIndex === -1) return null;
      for (let i = currentIndex + 1; i < sortedItems.length; i++) {
        if (sortedItems[i].statusId === 1) {
          return sortedItems[i];
        }
      }
      for (let i = 0; i < currentIndex; i++) {
        if (sortedItems[i].statusId === 1) {
          return sortedItems[i];
        }
      }
      return null;
    },

    getNextNavigationTarget(currentPointNumber: number): {
      type: 'POINT' | 'FINALIZE';
      point?: InspectionChecklistItem;
      route: string
    } {
      const nextPoint = this.findNextPendingPoint(currentPointNumber);
      if (nextPoint && this.currentInspection) {
        return {
          type: 'POINT',
          point: nextPoint,
          route: `/inspections/${this.currentInspection.id}/checklist`
        };
      } else if (this.currentInspection) {
        return {
          type: 'FINALIZE',
          route: `/inspections/${this.currentInspection.id}/checklist`
        };
      }
      return {
        type: 'FINALIZE',
        route: '/inspections'
      };
    },

    // ===================================================================
    // ACTIONS PARA O FLUXO DE LACRAÇÃO E CONFERÊNCIA
    // ===================================================================

    async performSealInitial(
      dto: SealInitialDto,
      files: { sealPhotos: File[], platePhotos: File[] }
    ) {
      if (!this.currentInspection) return;
      this.isSubmitting = true;
      this.error = null;
      try {
        // [CORREÇÃO] Não atualiza state local, apenas retorna ou aguarda
        await apiService.sealInitial(
          this.currentInspection.id,
          dto,
          files
        );
        // this.currentInspection = updatedInspection; // <--- REMOVIDO PARA EVITAR CRASH
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    async startLoading() {
      if (!this.currentInspection) return;
      this.isSubmitting = true;
      this.error = null;
      try {
        const updatedInspection = await apiService.startLoading(this.currentInspection.id);
        this.currentInspection = updatedInspection;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * Finaliza a conferência (Conferente).
     * Action da Store que chama o ApiService.
     */
    async finalizeConference(
      dto: FinalizeConferenceDto,
      files: { finalSealPhotos: File[], panoramicPhotos: File[] }
    ) {
      if (!this.currentInspection) return;

      this.isSubmitting = true;
      this.error = null;
      try {
        // O DTO já contém o hasPrecinto vindo do componente
        await apiService.finalizeConference(
          this.currentInspection.id,
          dto,
          files
        );
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    async overrideApproval(dto: OverrideInspectionDto) {
      if (!this.currentInspection) return;
      this.isSubmitting = true;
      this.error = null;
      try {
        // Não atualiza state local, pois vamos redirecionar
        await apiService.overrideApproval(
          this.currentInspection.id,
          dto
        );
        // this.currentInspection = updatedInspection; // <--- REMOVIDO
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    async updateSeal(sealId: number, dto: UpdateSealDto, file?: File) {
      if (!this.currentInspection) return;
      this.isSubmitting = true;
      try {
        await apiService.updateSeal(this.currentInspection.id, sealId, dto, file);
        await this.fetchInspectionById(this.currentInspection.id);
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    async deleteSeal(sealId: number) {
      if (!this.currentInspection) return;
      this.isSubmitting = true;
      try {
        await apiService.deleteSeal(this.currentInspection.id, sealId);
        await this.fetchInspectionById(this.currentInspection.id);
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    async updateInspectionImage(imageId: number, dto: UpdateInspectionImageDto, file?: File) {
      if (!this.currentInspection) return;
      this.isSubmitting = true;
      try {
        await apiService.updateInspectionImage(this.currentInspection.id, imageId, dto, file);
        await this.fetchInspectionById(this.currentInspection.id);
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },
    async submitRfbSeal(
      inspectionId: number,
      dto: RfbSealDto,
      files: {
        rfbPhoto: File;
        armadorPhoto?: File;
        precintoFront?: File;
        precintoRear?: File;
        precintoLeft?: File;
        precintoRight?: File;
        noPrecintoPhoto?: File;
      }
    ) {
      this.isSubmitting = true;
      this.error = null;
      try {
        // Agora o 'files' contém tudo o que o apiService espera
        await apiService.registerRfbSeal(inspectionId, dto, files);

        // Recarrega a lista
        await this.fetchInspections();

        // Atualiza a inspeção atual se estiver aberta
        if (this.currentInspection && this.currentInspection.id === inspectionId) {
          await this.fetchInspectionById(inspectionId);
        }
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },
    async fetchGateQueue() {
      this.isLoading = true;
      this.error = null;
      try {
        this.gateQueue = await apiService.getGateQueue();
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.isLoading = false;
      }
    },
    async registerGateExit(inspectionId: number) {
      this.isSubmitting = true;
      this.error = null;
      try {
        await apiService.registerExit(inspectionId);
        // Otimistic update: remove o item da fila localmente
        this.gateQueue = this.gateQueue.filter(i => i.id !== inspectionId);
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    }
  },
});