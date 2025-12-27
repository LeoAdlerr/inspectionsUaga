import { Test, TestingModule } from '@nestjs/testing';
import { GetMeUseCaseImpl } from 'src/domain/use-cases/impl/get-me.use-case.impl';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { RoleEntity } from 'src/infra/typeorm/entities/role.entity';

describe('GetMeUseCaseImpl', () => {
  let useCase: GetMeUseCaseImpl;
  let userRepository: UserRepositoryPort;

  const mockUserRepository = {
    findById: jest.fn(),
    // Adicionamos os outros métodos para que o mock seja completo
    findByEmailOrUsername: jest.fn(),
    create: jest.fn(),
    setRoles: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    findByIdWithAuthDetails: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMeUseCaseImpl,
        {
          provide: UserRepositoryPort,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetMeUseCaseImpl>(GetMeUseCaseImpl);
    userRepository = module.get<UserRepositoryPort>(UserRepositoryPort);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('deve retornar os dados do usuário (sem a senha) se o usuário for encontrado', async () => {
      // Arrange
      const userId = 1;
      const mockUserEntity = new UserEntity();
      Object.assign(mockUserEntity, {
        id: userId,
        fullName: 'Usuário Teste',
        username: 'userteste',
        passwordHash: 'hash_secreto',
        isActive: true,
        signaturePath: '/path/to/signature.png',
        roles: [{ id: 1, name: 'ADMIN' }] as RoleEntity[],
      });
      
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUserEntity);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).not.toBeNull();
      expect(result!.id).toEqual(userId);
      expect(result!.fullName).toEqual('Usuário Teste');
      expect(result!.signaturePath).toEqual('/path/to/signature.png');
      // Garante que a propriedade de senha não existe no objeto retornado
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('deve retornar null se o usuário não for encontrado', async () => {
      // Arrange
      const userId = 999;
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });
});