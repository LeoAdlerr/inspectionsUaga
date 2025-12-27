import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { FindUserByIdUseCase } from '../find-user-by-id.use-case';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';

type FoundUser = Omit<User, 'passwordHash'>;

@Injectable()
export class FindUserByIdUseCaseImpl implements FindUserByIdUseCase {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) { }

  async execute(id: number): Promise<FoundUser | null> {
    const userEntity = await this.userRepository.findById(id);

    if (!userEntity) {
      return null;
    }

    return this.mapToDomain(userEntity);
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