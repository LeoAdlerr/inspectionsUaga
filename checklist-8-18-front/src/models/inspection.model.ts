import type { User } from './auth.model';
import type { Lookup } from './lookup.model';

// Interface para as evidências de um item do checklist
export interface ItemEvidence {
  id: number;
  itemId: number;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// Interface para um item do checklist
export interface InspectionChecklistItem {
  id: number;
  inspectionId: number;
  masterPointId: number;
  observations?: string;
  statusId: number;
  status: Lookup;
  masterPoint: {
    id: number;
    pointNumber: number;
    name: string;
    description: string;
  };
  evidences: ItemEvidence[];
  createdAt: string;
  updatedAt: string;
}

// [NOVO] Interfaces para representar os dados salvos no banco (Visualização)
export interface InspectionSeal {
  id: number;
  inspectionId: number;
  sealNumber: string;
  photoPath?: string;
  stage?: string; // 'INITIAL' ou 'FINAL'
  createdAt?: string;
}

export interface InspectionImage {
  id: number;
  inspectionId: number;
  photoPath: string;
  description?: string;
  type?: string;
  createdAt?: string;
}

// Interface para a Inspeção completa (Espelho do Banco de Dados)
export interface Inspection {
  // Identificação
  id: number;
  inspectorId: number;
  inspector: User;
  
  // Novos campos de usuário
  conferenteId?: number;
  conferente?: User;

  driverName: string;
  
  // Dados da Carga
  entryRegistration?: string;
  vehiclePlates?: string;
  containerNumber: string; // Obrigatório
  transportDocument?: string;

  // Datas e Status
  startDatetime: string;
  endDatetime?: string;
  createdAt: string;
  status: Lookup;
  statusId?: number; // Útil para verificações rápidas (ex: if statusId === 2)

  // Relações (Lookups)
  modality: Lookup;
  operationType: Lookup;
  unitType: Lookup;
  containerType?: Lookup;

  // [CORREÇÃO DO ERRO DE COMPILAÇÃO]
  // Estes campos existem no banco e precisamos deles para mostrar na UI se já foi assinado
  driverSignaturePath?: string;
  inspectorSignaturePath?: string;
  sealVerificationSignaturePath?: string;

  // Medidas
  verifiedLength?: number;
  verifiedWidth?: number;
  verifiedHeight?: number;

  // Lacres (Legado / Compatibilidade)
  sealUagaPostInspection?: string;
  sealUagaPostLoading?: string;
  sealShipper?: string;
  sealRfb?: string;

  // Verificação de Portaria
  sealVerificationResponsibleName?: string;
  sealVerificationDate?: string;
  sealVerificationRfbStatusId?: number;
  sealVerificationShipperStatusId?: number;
  sealVerificationTapeStatusId?: number;

  // Campos de Texto
  observations?: string;
  actionTaken?: string;

  // Arrays de Dados
  items: InspectionChecklistItem[];
  
  // [NOVO] Listas retornadas pelo backend para exibir na tela de lacração/conferência
  seals?: InspectionSeal[];
  images?: InspectionImage[];
}