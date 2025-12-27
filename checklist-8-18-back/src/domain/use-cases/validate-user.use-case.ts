import { User } from '../models/user.model';

// Usamos Omit para garantir que a senha NUNCA seja retornada por este UseCase.
type ValidatedUser = Omit<User, 'passwordHash'>;

export abstract class ValidateUserUseCase {
  /**
   * Valida as credenciais de um usuário.
   * @param loginIdentifier O username ou email do usuário.
   * @param pass A senha em texto plano.
   * @returns O objeto do usuário (sem o hash da senha) ou null se a validação falhar.
   */
  abstract execute(loginIdentifier: string, pass: string): Promise<ValidatedUser | null>;
}