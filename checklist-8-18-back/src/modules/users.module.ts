import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from 'src/api/controllers/users.controller';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { RoleEntity } from 'src/infra/typeorm/entities/role.entity';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { UserRepository } from 'src/infra/typeorm/repositories/user.repository';

// Use Cases
import { CreateUserUseCase } from 'src/domain/use-cases/create-user.use-case';
import { CreateUserUseCaseImpl } from 'src/domain/use-cases/impl/create-user.use-case.impl';
import { FindAllUsersUseCase } from 'src/domain/use-cases/find-all-users.use-case';
import { FindAllUsersUseCaseImpl } from 'src/domain/use-cases/impl/find-all-users.use-case.impl';
import { FindUserByIdUseCase } from 'src/domain/use-cases/find-user-by-id.use-case';
import { FindUserByIdUseCaseImpl } from 'src/domain/use-cases/impl/find-user-by-id.use-case.impl';
import { UpdateUserUseCase } from 'src/domain/use-cases/update-user.use-case';
import { UpdateUserUseCaseImpl } from 'src/domain/use-cases/impl/update-user.use-case.impl';
import { ResetPasswordUseCase } from 'src/domain/use-cases/reset-password.use-case';
import { ResetPasswordUseCaseImpl } from 'src/domain/use-cases/impl/reset-password.use-case.impl';
import { SoftDeleteUserUseCase } from 'src/domain/use-cases/soft-delete-user.use-case';
import { SoftDeleteUserUseCaseImpl } from 'src/domain/use-cases/impl/soft-delete-user.use-case.impl';
import { GetMeUseCase } from 'src/domain/use-cases/get-me.use-case';
import { GetMeUseCaseImpl } from 'src/domain/use-cases/impl/get-me.use-case.impl';
import { UploadUserSignatureUseCase } from 'src/domain/use-cases/upload-user-signature.use-case';
import { UploadUserSignatureUseCaseImpl } from 'src/domain/use-cases/impl/upload-user-signature.use-case.impl';
import { DeleteUserSignatureUseCase } from 'src/domain/use-cases/delete-user-signature.use-case';
import {  DeleteUserSignatureUseCaseImpl } from 'src/domain/use-cases/impl/delete-user-signature.use-case.impl';
import { RolesController } from 'src/api/controllers/roles.controller';
import { LookupModule } from './lookup.module';
import { FileSystemModule } from 'src/infra/file-system/file-system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
    LookupModule,
    FileSystemModule,
  ],
  controllers: [
    UsersController,
    RolesController,
  ],
  providers: [
    // Repositório
    { provide: UserRepositoryPort, useClass: UserRepository },
    // Use Cases de Usuário
    { provide: CreateUserUseCase, useClass: CreateUserUseCaseImpl },
    { provide: FindAllUsersUseCase, useClass: FindAllUsersUseCaseImpl },
    { provide: FindUserByIdUseCase, useClass: FindUserByIdUseCaseImpl },
    { provide: UpdateUserUseCase, useClass: UpdateUserUseCaseImpl },
    { provide: ResetPasswordUseCase, useClass: ResetPasswordUseCaseImpl },
    { provide: SoftDeleteUserUseCase, useClass: SoftDeleteUserUseCaseImpl },
    { provide: GetMeUseCase, useClass: GetMeUseCaseImpl },
    { provide: UploadUserSignatureUseCase, useClass: UploadUserSignatureUseCaseImpl },
    { provide: DeleteUserSignatureUseCase, useClass: DeleteUserSignatureUseCaseImpl },
  ],
  exports: [
    UserRepositoryPort,
    GetMeUseCase,
  ],
})
export class UsersModule { }