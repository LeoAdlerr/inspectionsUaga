import { Inspection } from '../models/inspection.model';
import { AddRfbSealDto } from 'src/api/dtos/add-rfb-seal.dto';

// ATUALIZAÇÃO: Adicionando os novos campos de arquivo ao tipo
export type RfbSealFiles = {
  rfbPhoto: Express.Multer.File[];      // Obrigatório
  armadorPhoto?: Express.Multer.File[]; // Opcional

  // --- NOVOS CAMPOS PARA LOGICA CONDICIONAL (TASK-RFB-03) ---
  precintoFront?: Express.Multer.File[];
  precintoRear?: Express.Multer.File[];
  precintoLeft?: Express.Multer.File[];
  precintoRight?: Express.Multer.File[];
  
  noPrecintoPhoto?: Express.Multer.File[];
};

export abstract class AddRfbSealUseCase {
  abstract execute(
    inspectionId: number,
    dto: AddRfbSealDto,
    files: RfbSealFiles,
  ): Promise<Inspection>;
}