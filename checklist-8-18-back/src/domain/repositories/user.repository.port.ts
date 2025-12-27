import { UserEntity } from "src/infra/typeorm/entities/user.entity";

// Adicionamos um tipo para os filtros para manter o código limpo e seguro
export type UserFilters = {
  name?: string;
  role?: string;
};

export abstract class UserRepositoryPort {
  /**
   * Encontra um usuário pelo seu username OU email.
   * Usado no fluxo de autenticação.
   * @param identifier O username ou email do usuário.
   */
  abstract findByEmailOrUsername(identifier: string): Promise<UserEntity | null>;

  /**
   * Cria um novo registro de usuário no banco de dados.
   * @param user Os dados parciais da entidade do usuário a ser criado.
   */
  abstract create(user: Partial<UserEntity>): Promise<UserEntity>;

  /**
   * Associa uma lista de roles a um usuário específico.
   * @param userId O ID do usuário.
   * @param roleIds Um array com os IDs das roles a serem associadas.
   */
  abstract setRoles(userId: number, roleIds: number[]): Promise<UserEntity>;

  //  Adicionamos o novo contrato de busca com filtros
  /**
   * Encontra todos os usuários, aplicando filtros opcionais.
   * @param filters Objeto com os filtros a serem aplicados (name, role).
   */
  abstract findAll(filters: UserFilters): Promise<UserEntity[]>;

  /**
   * Encontra um único usuário pelo seu ID.
   * @param id O ID do usuário a ser encontrado.
   */
  abstract findById(id: number): Promise<UserEntity | null>;
   
  /**
   * Atualiza os dados de um usuário existente.
   * @param id O ID do usuário a ser atualizado.
   * @param data Um objeto com os campos a serem alterados.
   */
  abstract update(id: number, data: Partial<UserEntity>): Promise<void>;

  abstract findByIdWithAuthDetails(id: number): Promise<UserEntity | null>;
}