import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/api/controllers/users.controller';
import { CreateUserUseCase } from 'src/domain/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from 'src/domain/use-cases/find-all-users.use-case';
import { FindUserByIdUseCase } from 'src/domain/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from 'src/domain/use-cases/update-user.use-case';
import { SoftDeleteUserUseCase } from 'src/domain/use-cases/soft-delete-user.use-case';
import { ResetPasswordUseCase } from 'src/domain/use-cases/reset-password.use-case';
import { UploadUserSignatureUseCase } from 'src/domain/use-cases/upload-user-signature.use-case';
import { DeleteUserSignatureUseCase } from 'src/domain/use-cases/delete-user-signature.use-case';
import { CreateUserDto } from 'src/api/dtos/create-user.dto';
import { UpdateUserDto } from 'src/api/dtos/update-user.dto';
import { ResetPasswordDto } from 'src/api/dtos/reset-password.dto';
import { User } from 'src/domain/models/user.model';

describe('UsersController', () => {
  let controller: UsersController;
  let createUserUseCase: CreateUserUseCase;
  let findAllUsersUseCase: FindAllUsersUseCase;
  let findUserByIdUseCase: FindUserByIdUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let softDeleteUserUseCase: SoftDeleteUserUseCase;
  let resetPasswordUseCase: ResetPasswordUseCase;
  let uploadUserSignatureUseCase: UploadUserSignatureUseCase;
  let deleteUserSignatureUseCase: DeleteUserSignatureUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        // Fornecemos mocks para todos os UseCases injetados
        { provide: CreateUserUseCase, useValue: { execute: jest.fn() } },
        { provide: FindAllUsersUseCase, useValue: { execute: jest.fn() } },
        { provide: FindUserByIdUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateUserUseCase, useValue: { execute: jest.fn() } },
        { provide: SoftDeleteUserUseCase, useValue: { execute: jest.fn() } },
        { provide: ResetPasswordUseCase, useValue: { execute: jest.fn() } },
        { provide: UploadUserSignatureUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteUserSignatureUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    findAllUsersUseCase = module.get<FindAllUsersUseCase>(FindAllUsersUseCase);
    findUserByIdUseCase = module.get<FindUserByIdUseCase>(FindUserByIdUseCase);
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    softDeleteUserUseCase = module.get<SoftDeleteUserUseCase>(SoftDeleteUserUseCase);
    resetPasswordUseCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
    uploadUserSignatureUseCase = module.get<UploadUserSignatureUseCase>(UploadUserSignatureUseCase);
    deleteUserSignatureUseCase = module.get<DeleteUserSignatureUseCase>(DeleteUserSignatureUseCase);
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve chamar o FindAllUsersUseCase com os filtros corretos', async () => {
      const filters = { role: 'INSPECTOR' as any, name: 'John' };
      await controller.findAll(filters.role, filters.name);
      expect(findAllUsersUseCase.execute).toHaveBeenCalledWith(filters);
    });
  });

  describe('findById', () => {
    it('deve chamar o FindUserByIdUseCase e retornar o usuário', async () => {
      const userId = 1;
      const mockUser = { id: userId } as User;
      (findUserByIdUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.findById(userId);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('deve chamar o UpdateUserUseCase com os parâmetros corretos', async () => {
      const userId = 1;
      const dto = new UpdateUserDto();
      await controller.update(userId, dto);
      expect(updateUserUseCase.execute).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('create', () => {
    it('deve chamar o CreateUserUseCase e retornar o usuário criado', async () => {
      const dto = new CreateUserDto();
      const mockUser = { id: 1 } as User;
      (createUserUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(createUserUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('resetPassword', () => {
    it('deve chamar o ResetPasswordUseCase com os parâmetros corretos', async () => {
      const userId = 1;
      const dto = new ResetPasswordDto();
      await controller.resetPassword(userId, dto);
      expect(resetPasswordUseCase.execute).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('softDelete', () => {
    it('deve chamar o SoftDeleteUserUseCase com o ID correto', async () => {
      const userId = 1;
      await controller.softDelete(userId);
      expect(softDeleteUserUseCase.execute).toHaveBeenCalledWith(userId);
    });
  });

  describe('uploadMySignature', () => {
    it('deve chamar o UploadUserSignatureUseCase com o ID do usuário e o ficheiro', async () => {
      // Arrange
      const mockReq = { user: { userId: 1 } };
      const mockFile = {} as Express.Multer.File; // Criamos um mock simples do ficheiro

      // Act
      await controller.uploadMySignature(mockReq, mockFile);

      // Assert
      expect(uploadUserSignatureUseCase.execute).toHaveBeenCalledWith(
        mockReq.user.userId,
        mockFile,
      );
    });
  });

  describe('deleteMySignature', () => {
    it('deve chamar o DeleteUserSignatureUseCase com o ID do usuário correto', async () => {
      // Arrange
      const mockReq = { user: { userId: 1 } };

      // Act
      await controller.deleteMySignature(mockReq);

      // Assert
      expect(deleteUserSignatureUseCase.execute).toHaveBeenCalledWith(mockReq.user.userId);
    });
  });
});