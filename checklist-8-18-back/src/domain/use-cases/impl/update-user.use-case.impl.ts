import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { UpdateUserUseCase } from '../update-user.use-case';
import { UpdateUserDto } from 'src/api/dtos/update-user.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';

type FoundUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UpdateUserUseCaseImpl implements UpdateUserUseCase {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(id: number, dto: UpdateUserDto): Promise<FoundUser> {
    // 1. Garante que o usuário a ser atualizado existe.
    const userToUpdate = await this.userRepository.findById(id);
    if (!userToUpdate) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    // 2. Verifica se o novo username ou email já está em uso por OUTRO usuário.
    if (dto.username) {
      const existingUser = await this.userRepository.findByEmailOrUsername(dto.username);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('O username já está em uso por outro usuário.');
      }
    }
    if (dto.email) {
      const existingUser = await this.userRepository.findByEmailOrUsername(dto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('O email já está em uso por outro usuário.');
      }
    }

    // 3. Separa os dados de `roles` dos outros dados para atualização.
    const { roleIds, ...updateData } = dto;

    // 4. Atualiza os dados principais do usuário (fullName, username, etc.) se houver dados para atualizar
    if (Object.keys(updateData).length > 0) {
      await this.userRepository.update(id, updateData);
    }
    
    // 5. Se foram fornecidas novas roles, atualiza a associação.
    if (roleIds) {
      await this.userRepository.setRoles(id, roleIds);
    }

    // 6. Busca o usuário atualizado para retornar o estado final completo.
    const updatedUser = await this.userRepository.findById(id);
    if (!updatedUser) {
        // Este é um caso de erro extremo, mas é uma boa prática de defesa
        throw new NotFoundException(`Usuário com ID "${id}" desapareceu após a atualização.`);
    }
    return this.mapToDomain(updatedUser);
  }

  private mapToDomain(entity: UserEntity): FoundUser {
    const user = new User();
    user.id = entity.id;
    user.fullName = entity.fullName;
    user.username = entity.username;
    user.email = entity.email;
    user.isActive = entity.isActive;
    
    if (entity.roles) {
      user.roles = entity.roles.map(roleEntity => {
          const roleModel = new Role();
          roleModel.id = roleEntity.id;
          roleModel.name = roleEntity.name as RoleName;
          return roleModel;
      });
    } else {
        user.roles = [];
    }

    return user;
  }
}