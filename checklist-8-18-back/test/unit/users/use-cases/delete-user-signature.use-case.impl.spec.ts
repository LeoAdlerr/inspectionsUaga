import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserSignatureUseCaseImpl } from 'src/domain/use-cases/impl/delete-user-signature.use-case.impl';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';

describe('DeleteUserSignatureUseCaseImpl', () => {
  let useCase: DeleteUserSignatureUseCaseImpl;
  let userRepository: UserRepositoryPort;
  let fileSystemService: FileSystemPort;

  const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };
  const mockFileSystem = {
    deleteFileIfExists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserSignatureUseCaseImpl,
        { provide: UserRepositoryPort, useValue: mockUserRepository },
        { provide: FileSystemPort, useValue: mockFileSystem},
      ],
    }).compile();

    useCase = module.get<DeleteUserSignatureUseCaseImpl>(DeleteUserSignatureUseCaseImpl);
    userRepository = module.get<UserRepositoryPort>(UserRepositoryPort);
    fileSystemService = module.get<FileSystemPort>(FileSystemPort);
    jest.clearAllMocks();
  });

  it('deve apagar o ficheiro de assinatura e limpar o path no usuário', async () => {
    // Arrange
    const userId = 1;
    const signaturePath = 'path/to/signature.png';
    const mockUser = new UserEntity();
    Object.assign(mockUser, { id: userId, signaturePath });

    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(fileSystemService, 'deleteFileIfExists').mockResolvedValue(undefined);
    jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId);

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(fileSystemService.deleteFileIfExists).toHaveBeenCalledWith(signaturePath);
    expect(userRepository.update).toHaveBeenCalledWith(userId, { signaturePath: null });
  });

  it('não deve chamar a exclusão do ficheiro se o usuário não tiver uma assinatura', async () => {
    // Arrange
    const userId = 1;
    // Usuário sem assinatura
    const mockUser = new UserEntity();
    Object.assign(mockUser, { id: userId, signaturePath: null });
    
    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId);

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(fileSystemService.deleteFileIfExists).not.toHaveBeenCalled(); // Não deve ser chamado
    expect(userRepository.update).toHaveBeenCalledWith(userId, { signaturePath: null });
  });

  it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
    // Arrange
    const userId = 999;
    jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
    expect(fileSystemService.deleteFileIfExists).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});