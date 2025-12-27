import { Inject, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ValidateUserUseCase } from '../validate-user.use-case';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { User } from 'src/domain/models/user.model';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { Role, RoleName } from 'src/domain/models/role.model';

type ValidatedUser = Omit<User, 'passwordHash'>;

@Injectable()
export class ValidateUserUseCaseImpl implements ValidateUserUseCase {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(loginIdentifier: string, pass: string): Promise<ValidatedUser | null> {
    const userEntity = await this.userRepository.findByEmailOrUsername(loginIdentifier);

    // Passo 1 e 2: Verifica se o usuário existe e se a senha está correta
    if (!userEntity || !(await bcrypt.compare(pass, userEntity.passwordHash))) {
      // Se não encontrar o usuário OU a senha estiver errada, retorna null.
      // A LocalStrategy irá converter isto num 401 genérico.
      return null;
    }

    // A PARTIR DAQUI, TEMOS A CERTEZA DE QUE A SENHA ESTÁ CORRETA.

    // Agora, e só agora, verificamos se o usuário está ativo.
    if (!userEntity.isActive) {
      // Se o usuário está inativo, lançamos uma exceção específica.
      throw new ForbiddenException('Usuário desativado. Por favor, contacte o administrador.');
    }

    // Passo 4: Se chegou até aqui, o usuário é válido e ativo.
    return this.mapToDomain(userEntity);
  }
  
  private mapToDomain(entity: UserEntity): ValidatedUser {
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