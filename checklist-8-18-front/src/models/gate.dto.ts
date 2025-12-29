// src/models/gate.dto.ts

export interface GateQueueItem {
  id: number;
  vehiclePlates: string;
  containerNumber: string;
  driverName: string;
  rfbSeal: string;
  armadorSeal: string;
  releasedAt: string; 
}

// Enum para Motivos de Rejeição
export enum GateRejectionReason {
  WRONG_DATA = 'WRONG_DATA',         // Erro de Digitação -> Volta para Documental
  SEAL_DIVERGENCE = 'SEAL_DIVERGENCE' // Lacre Divergente -> Volta para Lacração RFB
}

// DTO de envio (apenas para tipagem, pois enviaremos FormData)
export interface RejectGateExitDto {
  reason: GateRejectionReason;
  observation?: string;
  file?: File;
}