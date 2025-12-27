import { User } from 'src/domain/models/user.model';

type UpdatedUser = Omit<User, 'passwordHash'>;

export abstract class DeleteUserSignatureUseCase {
  /**
   * Apaga o ficheiro de assinatura de um usuário e limpa o caminho no banco de dados.
   * @param userId O ID do usuário autenticado.
   * @returns Uma promessa que resolve para o objeto do usuário atualizado (sem o hash da senha).
   */
  abstract execute(userId: number): Promise<UpdatedUser>;
}