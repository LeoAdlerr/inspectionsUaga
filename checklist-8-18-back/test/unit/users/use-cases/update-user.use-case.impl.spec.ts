import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateUserUseCaseImpl } from 'src/domain/use-cases/impl/update-user.use-case.impl';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { UpdateUserDto } from 'src/api/dtos/update-user.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';

describe('UpdateUserUseCaseImpl', () => {
    let useCase: UpdateUserUseCaseImpl;
    let userRepository: UserRepositoryPort;

    const mockUserRepository = {
        findById: jest.fn(),
        findByEmailOrUsername: jest.fn(),
        update: jest.fn(),
        setRoles: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateUserUseCaseImpl,
                {
                    provide: UserRepositoryPort,
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<UpdateUserUseCaseImpl>(UpdateUserUseCaseImpl);
        userRepository = module.get<UserRepositoryPort>(UserRepositoryPort);
        jest.clearAllMocks();
    });

    it('deve atualizar os dados de um usuário e retornar o usuário atualizado', async () => {
        // Arrange
        const userId = 1;
        const dto: UpdateUserDto = { fullName: 'Nome Atualizado' };
        const mockUser = { id: userId, fullName: 'Nome Antigo' } as UserEntity;
        const mockUpdatedUser = { id: userId, fullName: 'Nome Atualizado' } as UserEntity;

        jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(mockUser); // Primeira busca
        jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);
        jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(mockUpdatedUser); // Segunda busca para retornar

        // Act
        const result = await useCase.execute(userId, dto);

        // Assert
        expect(userRepository.findById).toHaveBeenCalledWith(userId);
        expect(userRepository.update).toHaveBeenCalledWith(userId, dto);
        expect(result.fullName).toEqual('Nome Atualizado');
    });

    it('deve atualizar as roles de um usuário quando `roleIds` for fornecido', async () => {
        // Arrange
        const userId = 1;
        const dto: UpdateUserDto = { roleIds: [1, 2] };
        const mockUser = { id: userId } as UserEntity;

        jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
        jest.spyOn(userRepository, 'setRoles').mockResolvedValue({ ...mockUser, roles: [{ id: 1 }, { id: 2 }] } as any);

        // Act
        await useCase.execute(userId, dto);

        // Assert
        expect(userRepository.setRoles).toHaveBeenCalledWith(userId, dto.roleIds);
    });

    it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
        // Arrange
        const userId = 999;
        jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

        // Act & Assert
        await expect(useCase.execute(userId, {})).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ConflictException se o novo username já estiver em uso por outro usuário', async () => {
        // Arrange
        const userId = 1;
        const dto: UpdateUserDto = { username: 'user_existente' };
        const mockUserToUpdate = { id: userId, username: 'user_antigo' } as UserEntity;
        const mockOtherUser = { id: 2, username: 'user_existente' } as UserEntity;

        jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUserToUpdate);
        jest.spyOn(userRepository, 'findByEmailOrUsername').mockResolvedValue(mockOtherUser);

        // Act & Assert
        await expect(useCase.execute(userId, dto)).rejects.toThrow(ConflictException);
    });

    it('não deve lançar um erro de conflito se o username pertencer ao próprio usuário', async () => {
        // Arrange
        const userId = 1;
        const dto: UpdateUserDto = { username: 'meu_user' };
        const mockUser = { id: userId, username: 'meu_user' } as UserEntity;

        jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
        // Simula que a busca por 'meu_user' retorna o próprio usuário que estamos a editar
        jest.spyOn(userRepository, 'findByEmailOrUsername').mockResolvedValue(mockUser);

        // Act & Assert
        // O método não deve lançar um erro e deve prosseguir para a atualização
        await expect(useCase.execute(userId, dto)).resolves.toBeDefined();
        expect(userRepository.update).toHaveBeenCalled();
    });
});