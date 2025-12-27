import { User } from 'src/domain/models/user.model';

type FoundUser = Omit<User, 'passwordHash'>;

export abstract class FindUserByIdUseCase {
  /**
   * Encontra um único usuário pelo seu ID.
   * @param id O ID do usuário a ser encontrado.
   * @returns Uma promessa que resolve para o usuário (sem o hash da senha) ou null se não for encontrado.
   */
  abstract execute(id: number): Promise<FoundUser | null>;
}