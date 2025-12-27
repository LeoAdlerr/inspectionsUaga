import { ChangePasswordDto } from 'src/api/dtos/change-password.dto';

export abstract class ChangePasswordUseCase {
  /**
   * Executa a lógica de alteração de senha para o usuário autenticado.
   * @param userId O ID do usuário que está a fazer a requisição (extraído do token JWT).
   * @param dto O objeto com a senha antiga e a nova senha.
   * @returns Uma promessa que resolve quando a operação é concluída.
   */
  abstract execute(userId: number, dto: ChangePasswordDto): Promise<void>;
}