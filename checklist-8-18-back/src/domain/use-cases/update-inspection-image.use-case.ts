import { UpdateInspectionImageDto } from 'src/api/dtos/update-inspection-image.dto';
import { InspectionImageEntity } from 'src/infra/typeorm/entities/inspection-image.entity';

export abstract class UpdateInspectionImageUseCase {
  /**
   * Atualiza uma imagem/placa existente (descrição e/ou foto).
   * * @param inspectionId ID da inspeção (contexto de segurança).
   * @param imageId ID da imagem a ser editada.
   * @param dto Dados textuais a atualizar (opcional).
   * @param file Novo arquivo de imagem (opcional). Se enviado, substitui o anterior.
   */
  abstract execute(
    inspectionId: number,
    imageId: number,
    dto: UpdateInspectionImageDto,
    file?: Express.Multer.File,
  ): Promise<InspectionImageEntity>;
}