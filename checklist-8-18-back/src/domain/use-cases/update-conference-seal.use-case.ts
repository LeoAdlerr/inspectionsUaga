import { UpdateSealDto } from 'src/api/dtos/update-seal.dto';
import { InspectionSealEntity } from 'src/infra/typeorm/entities/inspection-seal.entity';

export abstract class UpdateConferenceSealUseCase {
  /**
   * Atualiza um lacre da etapa de CONFERÊNCIA (Final).
   * * Regras:
   * 1. Status deve ser 5 (EM_CONFERENCIA).
   * 2. O lacre deve ser do estágio FINAL (2).
   * 3. Permite alterar número e/ou substituir foto.
   */
  abstract execute(
    inspectionId: number,
    sealId: number,
    dto: UpdateSealDto,
    file?: Express.Multer.File,
  ): Promise<InspectionSealEntity>;
}