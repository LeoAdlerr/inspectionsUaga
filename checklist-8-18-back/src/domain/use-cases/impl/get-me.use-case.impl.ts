import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { GetMeUseCase } from '../get-me.use-case';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';

type FoundUser = Omit<User, 'passwordHash'>;

@Injectable()
export class GetMeUseCaseImpl implements GetMeUseCase {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(userId: number): Promise<FoundUser | null> {
    const userEntity = await this.userRepository.findById(userId);

    if (!userEntity) {
      return null;
    }
    
    // Mapeamos a entidade para o modelo de domínio para garantir a segurança e o tipo correto
    return this.mapToDomain(userEntity);
  }

  // Reutilizamos o nosso padrão de mapeamento
  private mapToDomain(entity: UserEntity): FoundUser {
    const user = new User();
    user.id = entity.id;
    user.fullName = entity.fullName;
    user.username = entity.username;
    user.email = entity.email;
    user.isActive = entity.isActive;
    user.signaturePath = entity.signaturePath; // Incluímos o novo campo
    
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