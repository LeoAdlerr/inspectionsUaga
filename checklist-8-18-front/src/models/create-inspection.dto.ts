export interface CreateInspectionDto {
  driverName: string;
  modalityId: number;
  operationTypeId: number;
  unitTypeId: number;
  
  // --- CAMPOS OBRIGATÓRIOS ---
  entryRegistration: string;
  vehiclePlates: string;
  containerNumber: string;

  // Campos Opcionais
  transportDocument?: string;
  containerTypeId?: number;
  verifiedLength?: number;
  verifiedWidth?: number;
  verifiedHeight?: number;
}