import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFilters, UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly typeormRepo: Repository<UserEntity>,
  ) { }

  async findByEmailOrUsername(loginIdentifier: string): Promise<UserEntity | null> {
    return this.typeormRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.email = :loginIdentifier OR user.username = :loginIdentifier', { loginIdentifier })
      .getOne();
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const newUser = this.typeormRepo.create(user);
    return this.typeormRepo.save(newUser);
  }

  async setRoles(userId: number, roleIds: number[]): Promise<UserEntity> {
    const user = await this.typeormRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${userId}" não encontrado.`);
    }
    const rolesToSet = roleIds.map(id => ({ id } as RoleEntity));
    user.roles = rolesToSet;
    return this.typeormRepo.save(user);
  }

  async findAll(filters: UserFilters): Promise<UserEntity[]> {
    const query = this.typeormRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role'); // Faz o JOIN para podermos filtrar e retornar as roles

    if (filters.name) {
      // Adiciona um filtro do tipo "LIKE" para o nome
      query.andWhere('user.fullName LIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.role) {
      // Adiciona um filtro para o nome da role
      query.andWhere('role.name = :role', { role: filters.role });
    }

    return query.getMany();
  }

  /**
   * Encontra um único usuário pelo seu ID.
   * @param id O ID do usuário a ser encontrado.
   */
  async findById(id: number): Promise<UserEntity | null> {
    // findOneBy é otimizado para buscas simples por uma coluna
    return this.typeormRepo.findOneBy({ id });
  }

  /**
   * Atualiza os dados de um usuário existente.
   * @param id O ID do usuário a ser atualizado.
   * @param data Um objeto com os campos a serem alterados.
   */
  async update(id: number, data: Partial<UserEntity>): Promise<void> {
    await this.typeormRepo.update(id, data);
  }

  async findByIdWithAuthDetails(id: number): Promise<UserEntity | null> {
    return this.typeormRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();
  }
}