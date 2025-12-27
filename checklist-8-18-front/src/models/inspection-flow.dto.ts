// Enum para a decisão do Documental
export enum OverrideDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT'
}

// DTO para a Lacração Inicial (Inspetor)
export interface SealInitialDto {
  sealNumbers: string[]; 
}

// DTO para editar um lacre específico
export interface UpdateSealDto {
  sealNumber?: string;
}

// DTO para editar uma foto
export interface UpdateInspectionImageDto {
  description?: string;
}

// [ATUALIZADO] DTO para a Finalização da Conferência (Conferente)
export interface FinalizeConferenceDto {
  finalSealNumbers: string[]; 
  hasPrecinto: boolean; // [NOVO] Conferente define aqui se precisa de precinto
}

// DTO para o Override (Agora com Decision)
export interface OverrideInspectionDto {
  decision: OverrideDecision; 
  justification: string;
}

// DTO para Lacração RFB (Documental)
export interface RfbSealDto {
  rfbSealNumber: string;
  hasPrecinto: boolean; // Mantido para tipagem do formulário (visual), mas a decisão vem do banco
  armadorSealNumber?: string;
}