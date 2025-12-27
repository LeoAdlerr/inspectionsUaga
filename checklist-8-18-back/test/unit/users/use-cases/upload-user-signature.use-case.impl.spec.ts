import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UploadUserSignatureUseCaseImpl } from 'src/domain/use-cases/impl/upload-user-signature.use-case.impl';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';

type UploadedFile = Express.Multer.File;

describe('UploadUserSignatureUseCaseImpl', () => {
  let useCase: UploadUserSignatureUseCaseImpl;
  let userRepository: UserRepositoryPort;
  let fileSystem: FileSystemPort;

  const mockUserRepository = { findById: jest.fn(), update: jest.fn() };
  const mockFileSystem = { saveFile: jest.fn(), deleteFileIfExists: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadUserSignatureUseCaseImpl,
        { provide: UserRepositoryPort, useValue: mockUserRepository },
        { provide: FileSystemPort, useValue: mockFileSystem },
      ],
    }).compile();

    useCase = module.get<UploadUserSignatureUseCaseImpl>(UploadUserSignatureUseCaseImpl);
    userRepository = module.get<UserRepositoryPort>(UserRepositoryPort);
    fileSystem = module.get<FileSystemPort>(FileSystemPort);
    jest.clearAllMocks();
  });

  it('deve salvar uma nova assinatura e atualizar o usuário', async () => {
    // Arrange
    const userId = 1;
    const mockFile = { originalname: 'assinatura.png', buffer: Buffer.from('fake-image') } as UploadedFile;
    // Criamos uma instância real da entidade
    const mockUser = new UserEntity();
    Object.assign(mockUser, { id: userId, signaturePath: null });
    
    const newPath = 'uploads/signatures/user_1_signature.png';

    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(fileSystem, 'saveFile').mockResolvedValue(newPath);
    jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId, mockFile);

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(fileSystem.deleteFileIfExists).not.toHaveBeenCalled();
    expect(fileSystem.saveFile).toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalledWith(userId, { signaturePath: newPath });
  });

  it('deve apagar a assinatura antiga antes de salvar a nova', async () => {
    // Arrange
    const userId = 1;
    const mockFile = { originalname: 'nova_assinatura.png', buffer: Buffer.from('new-fake-image') } as UploadedFile;
    const oldPath = 'uploads/signatures/assinatura_antiga.png';
    // Criamos uma instância real da entidade
    const mockUser = new UserEntity();
    Object.assign(mockUser, { id: userId, signaturePath: oldPath });

    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(fileSystem, 'saveFile').mockResolvedValue('new_path.png');
    jest.spyOn(fileSystem, 'deleteFileIfExists').mockResolvedValue(undefined);
    jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId, mockFile);

    // Assert
    expect(fileSystem.deleteFileIfExists).toHaveBeenCalledWith(oldPath);
  });

  it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
    // Arrange
    const userId = 999;
    const mockFile = {} as UploadedFile;
    jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(userId, mockFile)).rejects.toThrow(NotFoundException);
  });
});