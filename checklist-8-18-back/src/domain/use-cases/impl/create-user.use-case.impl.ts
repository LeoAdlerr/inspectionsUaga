import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserUseCase } from '../create-user.use-case';
import { CreateUserDto } from 'src/api/dtos/create-user.dto';
import { User } from 'src/domain/models/user.model';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { Role, RoleName } from 'src/domain/models/role.model';

type CreatedUser = Omit<User, 'passwordHash'>;

@Injectable()
export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<CreatedUser> {
    // Lógica de verificação e criação (continua a mesma)
    const existingUser = await this.userRepository.findByEmailOrUsername(dto.username);
    if (existingUser) {
      throw new BadRequestException('Username já está em uso.');
    }
    if (dto.email) {
      const existingEmail = await this.userRepository.findByEmailOrUsername(dto.email);
      if (existingEmail) {
        throw new BadRequestException('Email já está em uso.');
      }
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const newUserEntity = await this.userRepository.create({
      fullName: dto.fullName,
      username: dto.username,
      email: dto.email,
      passwordHash: passwordHash,
    });
    const userWithRolesEntity = await this.userRepository.setRoles(newUserEntity.id, dto.roleIds);

    return this.mapToDomain(userWithRolesEntity);
  }

  private mapToDomain(entity: UserEntity): CreatedUser {
    const user = new User();
    user.id = entity.id;
    user.fullName = entity.fullName;
    user.username = entity.username;
    user.email = entity.email;
    user.isActive = entity.isActive;
    
    // Mapeamos explicitamente o array de roles
    user.roles = entity.roles.map(roleEntity => {
        const roleModel = new Role();
        roleModel.id = roleEntity.id;
        roleModel.name = roleEntity.name as RoleName; // Fazemos um type assertion aqui
        return roleModel;
    });

    return user;
  }
}