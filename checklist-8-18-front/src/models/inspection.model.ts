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

// Interfaces para representar os dados salvos no banco (Visualização)
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

// Interface para a Inspeção completa (Sincronizada com o Backend)
export interface Inspection {
  // --- Identificação Principal ---
  id: number;
  statusId: number;
  status: Lookup; // Relação preenchida
  
  // --- Usuários Responsáveis ---
  inspectorId?: number;
  inspector?: User;
  
  conferenteId?: number;
  conferente?: User;

  // [NOVO] Operador de Portaria
  gateOperatorId?: number;
  gateOperator?: User;

  // --- Dados da Carga/Motorista ---
  driverName: string;
  entryRegistration?: string;
  vehiclePlates?: string;
  containerNumber: string; 
  transportDocument?: string;
  
  // [NOVO] Controle de Precinto (Crítico para TASK-RFB-03)
  hasPrecinto: boolean; 

  // --- Timestamps (Datas) ---
  // Nota: No Frontend recebemos como string (ISO format) do JSON
  createdAt: string;
  updatedAt: string;
  startDatetime: string;
  endDatetime?: string;         // Fim Geral
  
  // [NOVOS] Timestamps de Fluxo
  inspectionStartedAt?: string;
  conferenceStartedAt?: string;
  conferenceEndedAt?: string;
  gateOutAt?: string;           // Momento da Saída Física

  // --- Relações (Lookups) ---
  modalityId: number;
  modality: Lookup;
  
  operationTypeId: number;
  operationType: Lookup;
  
  unitTypeId: number;
  unitType: Lookup;
  
  containerTypeId?: number;
  containerType?: Lookup;

  // --- Assinaturas (Caminhos) ---
  driverSignaturePath?: string;
  inspectorSignaturePath?: string;
  sealVerificationSignaturePath?: string;

  // --- Medidas Verificadas ---
  verifiedLength?: number;
  verifiedWidth?: number;
  verifiedHeight?: number;

  // --- Lacres (Campos Legados/Compatibilidade) ---
  sealUagaPostInspection?: string;
  sealUagaPostLoading?: string;
  sealShipper?: string;
  sealRfb?: string;

  // --- Verificação de Portaria (Gate Check) ---
  sealVerificationResponsibleName?: string;
  sealVerificationDate?: string;
  // IDs dos status da verificação
  sealVerificationRfbStatusId?: number;
  sealVerificationShipperStatusId?: number;
  sealVerificationTapeStatusId?: number;
  // Objetos Lookup completos (opcional, se o back enviar)
  sealVerificationRfbStatus?: Lookup;
  sealVerificationShipperStatus?: Lookup;

  // --- Campos de Texto / Arquivos ---
  observations?: string;
  actionTaken?: string;
  generatedPdfPath?: string; // [NOVO] Caminho do PDF final gerado

  // --- Listas de Dados ---
  items: InspectionChecklistItem[];
  seals?: InspectionSeal[];
  images?: InspectionImage[];
}