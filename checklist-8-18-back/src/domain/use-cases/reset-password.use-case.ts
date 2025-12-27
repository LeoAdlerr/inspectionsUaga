import { ResetPasswordDto } from 'src/api/dtos/reset-password.dto';

export abstract class ResetPasswordUseCase {
  /**
   * Executa a redefinição de senha para um usuário específico.
   * Lógica a ser executada por um Administrador.
   * @param id O ID do usuário-alvo.
   * @param dto O objeto contendo a nova senha.
   * @returns Uma promessa que resolve quando a operação é concluída.
   */
  abstract execute(id: number, dto: ResetPasswordDto): Promise<void>;
}