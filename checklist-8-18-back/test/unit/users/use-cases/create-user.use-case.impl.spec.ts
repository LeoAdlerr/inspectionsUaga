import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateUserUseCaseImpl } from 'src/domain/use-cases/impl/create-user.use-case.impl';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { CreateUserDto } from 'src/api/dtos/create-user.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from 'src/infra/typeorm/entities/role.entity';

jest.mock('bcrypt');

describe('CreateUserUseCaseImpl', () => {
  let useCase: CreateUserUseCaseImpl;
  let userRepository: UserRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCaseImpl,
        {
          provide: UserRepositoryPort,
          useValue: {
            findByEmailOrUsername: jest.fn(),
            create: jest.fn(),
            setRoles: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCaseImpl>(CreateUserUseCaseImpl);
    userRepository = module.get<UserRepositoryPort>(UserRepositoryPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um usuário com sucesso quando os dados são válidos', async () => {
    // Arrange
    const dto: CreateUserDto = {
      fullName: 'Teste',
      username: 'teste',
      email: 'teste@teste.com',
      password: 'password123',
      roleIds: [1],
    };

    jest.spyOn(userRepository, 'findByEmailOrUsername').mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    
    const createdUser = { id: 1, ...dto } as unknown as UserEntity;
    jest.spyOn(userRepository, 'create').mockResolvedValue(createdUser);

    const userWithRoles = { ...createdUser, roles: [{ id: 1, name: 'ADMIN' }] } as UserEntity;
    jest.spyOn(userRepository, 'setRoles').mockResolvedValue(userWithRoles);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        passwordHash: 'hashed_password'
    }));
    expect(userRepository.setRoles).toHaveBeenCalledWith(createdUser.id, dto.roleIds);
    // Verificamos que a propriedade 'passwordHash' não existe no objeto de retorno.
    expect(result).not.toHaveProperty('passwordHash');
    expect(result.id).toBe(1);
  });

  it('deve lançar um BadRequestException se o username já existir', async () => {
    // Arrange
    const dto: CreateUserDto = { fullName: 'Teste', username: 'existente', password: '123', roleIds: [1] };
    jest.spyOn(userRepository, 'findByEmailOrUsername').mockResolvedValue({ id: 1 } as UserEntity);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(
        new BadRequestException('Username já está em uso.')
    );
  });
  
  it('deve lançar um BadRequestException se o email já existir', async () => {
    // Arrange
    const dto: CreateUserDto = { fullName: 'Teste', username: 'novo_user', email: 'existente@email.com', password: '123', roleIds: [1] };
    // Simula que o username é único, mas o email não
    jest.spyOn(userRepository, 'findByEmailOrUsername')
      .mockResolvedValueOnce(null) // para a verificação do username
      .mockResolvedValueOnce({ id: 2 } as UserEntity); // para a verificação do email

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(
        new BadRequestException('Email já está em uso.')
    );
  });
});