import { Inspection } from '../models/inspection.model';
import { RegisterGateExitDto } from 'src/api/dtos/register-gate-exit.dto';

export abstract class RegisterGateExitUseCase {
  /**
   * Registra a saída, atualiza status dos lacres e gera o PDF final.
   * @param inspectionId ID da inspeção
   * @param userId ID do usuário logado (Portaria)
   * @param dto Dados da validação de lacres
   */
  abstract execute(
    inspectionId: number, 
    userId: number, 
    dto: RegisterGateExitDto
  ): Promise<Inspection>;
}