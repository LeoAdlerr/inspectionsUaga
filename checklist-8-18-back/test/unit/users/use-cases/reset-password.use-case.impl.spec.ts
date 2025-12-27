import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ResetPasswordUseCaseImpl } from 'src/domain/use-cases/impl/reset-password.use-case.impl';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { ResetPasswordDto } from 'src/api/dtos/reset-password.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('ResetPasswordUseCaseImpl', () => {
  let useCase: ResetPasswordUseCaseImpl;
  let userRepository: UserRepositoryPort;

  const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCaseImpl,
        {
          provide: UserRepositoryPort,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<ResetPasswordUseCaseImpl>(ResetPasswordUseCaseImpl);
    userRepository = module.get<UserRepositoryPort>(UserRepositoryPort);
    jest.clearAllMocks();
  });

  it('deve redefinir a senha do usuário com sucesso', async () => {
    // Arrange
    const userId = 1;
    const dto: ResetPasswordDto = { newPassword: 'nova_senha_123' };
    const mockUser = { id: userId } as UserEntity;
    const newHashedPassword = 'novo_hash_da_senha';

    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue(newHashedPassword);
    jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId, dto);

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(bcrypt.hash).toHaveBeenCalledWith(dto.newPassword, 10);
    expect(userRepository.update).toHaveBeenCalledWith(userId, {
      passwordHash: newHashedPassword,
    });
  });

  it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
    // Arrange
    const userId = 999;
    const dto: ResetPasswordDto = { newPassword: 'nova_senha_123' };
    jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(userId, dto)).rejects.toThrow(NotFoundException);
  });
});