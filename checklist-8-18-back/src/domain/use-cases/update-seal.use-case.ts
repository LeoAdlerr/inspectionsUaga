import { UpdateSealDto } from 'src/api/dtos/update-seal.dto';
import { InspectionSealEntity } from 'src/infra/typeorm/entities/inspection-seal.entity';

export abstract class UpdateSealUseCase {
  /**
   * Atualiza um lacre existente (número e/ou foto).
   * * @param inspectionId ID da inspeção (contexto de segurança).
   * @param sealId ID do lacre a ser editado.
   * @param dto Dados textuais a atualizar (opcional).
   * @param file Novo arquivo de imagem (opcional). Se enviado, substitui o anterior.
   */
  abstract execute(
    inspectionId: number,
    sealId: number,
    dto: UpdateSealDto,
    file?: Express.Multer.File,
  ): Promise<InspectionSealEntity>;
}