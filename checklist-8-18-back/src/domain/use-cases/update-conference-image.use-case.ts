import { UpdateInspectionImageDto } from 'src/api/dtos/update-inspection-image.dto';
import { InspectionImageEntity } from 'src/infra/typeorm/entities/inspection-image.entity';

export abstract class UpdateConferenceImageUseCase {
  /**
   * Atualiza uma imagem da etapa de CONFERÊNCIA (Panorâmica).
   * * Regras:
   * 1. Status deve ser 5 (EM_CONFERENCIA).
   * 2. A imagem deve ser da categoria PANORAMIC (2).
   * 3. Permite alterar descrição e/ou substituir foto.
   */
  abstract execute(
    inspectionId: number,
    imageId: number,
    dto: UpdateInspectionImageDto,
    file?: Express.Multer.File,
  ): Promise<InspectionImageEntity>;
}