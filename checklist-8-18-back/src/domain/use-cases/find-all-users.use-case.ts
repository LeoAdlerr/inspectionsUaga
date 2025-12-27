import { User } from 'src/domain/models/user.model';
import { UserFilters } from '../repositories/user.repository.port';

// Definimos um tipo para o retorno, garantindo que a senha nunca seja exposta.
type FoundUser = Omit<User, 'passwordHash'>;

export abstract class FindAllUsersUseCase {
  /**
   * Executa a busca por usuários com base em filtros opcionais.
   * @param filters Os filtros a serem aplicados (name, role).
   * @returns Uma promessa que resolve para um array de usuários (sem o hash da senha).
   */
  abstract execute(filters: UserFilters): Promise<FoundUser[]>;
}