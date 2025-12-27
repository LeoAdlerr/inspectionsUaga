import { User } from 'src/domain/models/user.model';

// Definimos um tipo para o retorno, garantindo que a senha nunca seja exposta.
type FoundUser = Omit<User, 'passwordHash'>;

export abstract class GetMeUseCase {
  /**
   * Busca os dados completos do usuário autenticado.
   * @param userId O ID do usuário logado (extraído do token JWT).
   * @returns Uma promessa que resolve para o objeto do usuário (sem o hash da senha) ou null se não for encontrado.
   */
  abstract execute(userId: number): Promise<FoundUser | null>;
}