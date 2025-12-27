import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ValidateUserUseCaseImpl } from 'src/domain/use-cases/impl/validate-user.use-case.impl';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from 'src/infra/typeorm/entities/role.entity';

jest.mock('bcrypt');

describe('ValidateUserUseCaseImpl', () => {
  let useCase: ValidateUserUseCaseImpl;
  let userRepository: UserRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateUserUseCaseImpl,
        {
          provide: UserRepositoryPort,
          useValue: {
            findByEmailOrUsername: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ValidateUserUseCaseImpl>(ValidateUserUseCaseImpl);
    userRepository = module.get<UserRepositoryPort>(UserRepositoryPort);
    jest.clearAllMocks();
  });

  it('deve retornar os dados do usuário se as credenciais forem válidas e o usuário estiver ativo', async () => {
    // Arrange
    const mockUser = new UserEntity();
    mockUser.id = 1;
    mockUser.passwordHash = 'hashed_password';
    mockUser.isActive = true;
    mockUser.roles = [{ id: 1, name: 'ADMIN' }] as RoleEntity[];
    
    jest.spyOn(userRepository, 'findByEmailOrUsername').mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Act
    const result = await useCase.execute('teste', 'senha123');

    // Assert
    expect(result).not.toBeNull();
    expect(result!.id).toBe(1);
  });

  it('deve retornar null se o usuário não for encontrado', async () => {
    jest.spyOn(userRepository, 'findByEmailOrUsername').mockResolvedValue(null);
    const result = await useCase.execute('invalido', 'senha123');
    expect(result).toBeNull();
  });

  it('deve retornar null se a senha estiver incorreta', async () => {
    const mockUser = new UserEntity();
    jest.spyOn(userRepository, 'findByEmailOrUsername').mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await useCase.execute('teste', 'senha_errada');
    expect(result).toBeNull();
  });

  it('deve lançar ForbiddenException se as credenciais estiverem corretas mas o usuário estiver inativo', async () => {
    // Arrange
    const mockUser = new UserEntity();
    mockUser.passwordHash = 'hashed_password';
    mockUser.isActive = false; // Usuário inativo
    
    jest.spyOn(userRepository, 'findByEmailOrUsername').mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Senha está correta

    // Act & Assert
    await expect(useCase.execute('inativo', 'senha123')).rejects.toThrow(ForbiddenException);
  });
});