import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';
import { UserFilters, UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { FindAllUsersUseCase } from '../find-all-users.use-case';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';

type FoundUser = Omit<User, 'passwordHash'>;

@Injectable()
export class FindAllUsersUseCaseImpl implements FindAllUsersUseCase {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(filters: UserFilters): Promise<FoundUser[]> {
    const userEntities = await this.userRepository.findAll(filters);
    
    // Mapeamos cada entidade para o nosso modelo de domínio limpo
    return userEntities.map(entity => this.mapToDomain(entity));
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