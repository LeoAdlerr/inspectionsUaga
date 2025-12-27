import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChangePasswordUseCaseImpl } from 'src/domain/use-cases/impl/change-password.use-case.impl';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { ChangePasswordDto } from 'src/api/dtos/change-password.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('ChangePasswordUseCaseImpl', () => {
  let useCase: ChangePasswordUseCaseImpl;
  let userRepository: UserRepositoryPort;

  const mockUserRepository = {
    findByIdWithAuthDetails: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCaseImpl,
        {
          provide: UserRepositoryPort,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<ChangePasswordUseCaseImpl>(ChangePasswordUseCaseImpl);
    userRepository = module.get<UserRepositoryPort>(UserRepositoryPort);
    jest.clearAllMocks();
  });

  it('deve alterar a senha com sucesso se a senha antiga estiver correta', async () => {
    // Arrange
    const userId = 1;
    const dto: ChangePasswordDto = { oldPassword: 'senha_antiga', newPassword: 'nova_senha' };
    const mockUser = { id: userId, passwordHash: 'hash_antigo' } as UserEntity;
    
    jest.spyOn(userRepository, 'findByIdWithAuthDetails').mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId, dto);

    // Assert
    expect(userRepository.findByIdWithAuthDetails).toHaveBeenCalledWith(userId);
    // ... (o resto das asserções permanece igual)
  });

  it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
    // Arrange
    jest.spyOn(userRepository, 'findByIdWithAuthDetails').mockResolvedValue(null);
    
    // Act & Assert
    await expect(useCase.execute(1, {} as any)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar UnauthorizedException se a senha antiga estiver incorreta', async () => {
    // Arrange
    const mockUser = { id: 1, passwordHash: 'hash_antigo' } as UserEntity;
    jest.spyOn(userRepository, 'findByIdWithAuthDetails').mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act & Assert
    await expect(useCase.execute(1, { oldPassword: 'errada' } as any)).rejects.toThrow(UnauthorizedException);
  });
});