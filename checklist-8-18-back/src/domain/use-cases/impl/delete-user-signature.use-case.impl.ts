import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeleteUserSignatureUseCase } from '../delete-user-signature.use-case';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';

type UpdatedUser = Omit<User, 'passwordHash'>;

@Injectable()
export class DeleteUserSignatureUseCaseImpl implements DeleteUserSignatureUseCase {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
  ) {}

  async execute(userId: number): Promise<UpdatedUser> {
    // 1. Busca o usuário para garantir que ele existe e para obter o caminho da assinatura.
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${userId}" não encontrado.`);
    }

    // 2. Se o usuário tiver uma assinatura, apaga o ficheiro correspondente.
    if (user.signaturePath) {
      await this.fileSystem.deleteFileIfExists(user.signaturePath);
    }

    // 3. Atualiza o registro do usuário, definindo o caminho da assinatura como nulo.
    await this.userRepository.update(userId, { signaturePath: null });

    // 4. Retorna os dados atualizados do usuário.
    const updatedUser = await this.userRepository.findById(userId);
    return this.mapToDomain(updatedUser!);
  }

  private mapToDomain(entity: UserEntity): UpdatedUser {
    const user = new User();
    user.id = entity.id;
    user.fullName = entity.fullName;
    user.username = entity.username;
    user.email = entity.email;
    user.isActive = entity.isActive;
    user.signaturePath = entity.signaturePath;
    
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