import { Inspection } from '../models/inspection.model';
import { OverrideInspectionDto } from 'src/api/dtos/override-inspection.dto';

export abstract class OverrideInspectionUseCase {
  /**
   * Permite que um usuário com perfil DOCUMENTAL ou ADMIN force a aprovação
   * de uma inspeção que foi anteriormente REPROVADA.
   * * Lógica:
   * 1. Valida se a inspeção está REPROVADA (Status 3).
   * 2. Atualiza o status para APROVADO_COM_RESSALVAS (Status 8) ou APROVADO (2).
   * 3. Registra a justificativa no campo de providências/observações.
   *
   * @param inspectionId ID da inspeção.
   * @param userId ID do usuário realizando o override (para log de auditoria).
   * @param dto Dados do override (justificativa obrigatória).
   * @returns A inspeção atualizada.
   */
  abstract execute(
    inspectionId: number,
    userId: number,
    dto: OverrideInspectionDto,
  ): Promise<Inspection>;
}