import { Lookup } from './lookup.model';

export class InspectionSeal {
  id: number;
  inspectionId: number;
  sealNumber: string;
  
  // IDs de relacionamento
  stageId: number;

  // Status da verificação individual (Portaria)
  verificationStatusId?: number | null;
  
  // Caminho do arquivo
  photoPath?: string | null;
  
  // Data de criação
  createdAt: Date;

  // Objetos de relacionamento (Opcionais)
  stage?: Lookup;

  // Objeto do Status
  verificationStatus?: Lookup;
}