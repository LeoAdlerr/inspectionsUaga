import { Lookup } from './lookup.model';

export class InspectionImage {
  id: number;
  inspectionId: number;
  
  // IDs de relacionamento
  categoryId: number;
  
  // Caminho do arquivo e descrição
  photoPath: string;
  description?: string | null;
  
  // Data de criação
  createdAt: Date;

  // Objetos de relacionamento (Opcionais)
  category?: Lookup;
}