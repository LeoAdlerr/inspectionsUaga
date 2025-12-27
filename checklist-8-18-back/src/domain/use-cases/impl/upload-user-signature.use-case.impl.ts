import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import { UploadUserSignatureUseCase } from '../upload-user-signature.use-case';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';

type UploadedFile = Express.Multer.File;
type UpdatedUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UploadUserSignatureUseCaseImpl implements UploadUserSignatureUseCase {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystemService: FileSystemPort,
  ) {}

  async execute(userId: number, file: UploadedFile): Promise<UpdatedUser> {
    // 1. Busca o usuário para garantir que ele existe.
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${userId}" não encontrado.`);
    }

    // 2. Se o usuário já tiver uma assinatura, apaga o ficheiro antigo.
    if (user.signaturePath) {
      await this.fileSystemService.deleteFileIfExists(user.signaturePath);
    }

    // 3. Define um nome de ficheiro único e salva o novo ficheiro.
    const fileExtension = path.extname(file.originalname);
    const fileName = `user_${userId}_signature${fileExtension}`;
    const directory = 'signatures'; // Salvaremos numa subpasta para organização
    
    const newSignaturePath = await this.fileSystemService.saveFile(
      directory,
      fileName,
      file.buffer,
    );

    // 4. Atualiza o registro do usuário com o novo caminho da assinatura.
    await this.userRepository.update(userId, { signaturePath: newSignaturePath });

    // 5. Retorna os dados atualizados do usuário.
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