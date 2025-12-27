import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SoftDeleteUserUseCaseImpl } from 'src/domain/use-cases/impl/soft-delete-user.use-case.impl';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';

describe('SoftDeleteUserUseCaseImpl', () => {
  let useCase: SoftDeleteUserUseCaseImpl;
  let userRepository: UserRepositoryPort;

  const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftDeleteUserUseCaseImpl,
        {
          provide: UserRepositoryPort,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<SoftDeleteUserUseCaseImpl>(SoftDeleteUserUseCaseImpl);
    userRepository = module.get<UserRepositoryPort>(UserRepositoryPort);
    jest.clearAllMocks();
  });

  it('deve desativar um usuário com sucesso', async () => {
    // Arrange
    const userId = 1;
    const mockUser = { id: userId, isActive: true } as UserEntity;

    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId);

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.update).toHaveBeenCalledWith(userId, { isActive: false });
  });

  it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
    // Arrange
    const userId = 999;
    jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});