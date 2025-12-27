import { User } from 'src/domain/models/user.model';
import { UpdateUserDto } from 'src/api/dtos/update-user.dto';

type FoundUser = Omit<User, 'passwordHash'>;

export abstract class UpdateUserUseCase {
  /**
   * Executa a lógica de atualização de um usuário.
   * @param id O ID do usuário a ser atualizado.
   * @param dto O objeto com os dados a serem alterados.
   * @returns Uma promessa que resolve para o usuário atualizado (sem o hash da senha).
   */
  abstract execute(id: number, dto: UpdateUserDto): Promise<FoundUser>;
}