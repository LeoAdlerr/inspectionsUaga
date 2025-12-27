import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuthController } from 'src/api/controllers/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { User } from 'src/domain/models/user.model';
import { ChangePasswordUseCase } from 'src/domain/use-cases/change-password.use-case';
import { ChangePasswordDto } from 'src/api/dtos/change-password.dto';
import { GetMeUseCase } from 'src/domain/use-cases/get-me.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let changePasswordUseCase: ChangePasswordUseCase;
  let getMeUseCase: GetMeUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: { login: jest.fn() } },
        { provide: ChangePasswordUseCase, useValue: { execute: jest.fn() } },
        { provide: GetMeUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    changePasswordUseCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
    getMeUseCase = module.get<GetMeUseCase>(GetMeUseCase);
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('deve chamar o authService.login com o usuário do request e retornar o token', async () => {
      // Arrange
      const mockUser = { id: 1, username: 'teste' } as User;
      const mockRequest = { user: mockUser };
      const expectedToken = { access_token: 'fake-jwt-token' };

      (authService.login as jest.Mock).mockResolvedValue(expectedToken);

      // Act
      const result = await controller.login(mockRequest);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedToken);
    });
  });

  describe('changeMyPassword', () => {
    it('deve chamar o ChangePasswordUseCase com o ID do usuário e o DTO', async () => {
      // Arrange
      const mockReq = { user: { userId: 1 } };
      const mockDto: ChangePasswordDto = { oldPassword: '123', newPassword: '456' };

      // Act
      await controller.changeMyPassword(mockReq, mockDto);

      // Assert
      expect(changePasswordUseCase.execute).toHaveBeenCalledWith(mockReq.user.userId, mockDto);
    });
  });

  describe('getMe', () => {
    it('deve chamar o GetMeUseCase e retornar o usuário encontrado', async () => {
      // Arrange
      const mockReq = { user: { userId: 1 } };
      const mockUser = { id: 1, username: 'teste' } as User;
      (getMeUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await controller.getMe(mockReq);

      // Assert
      expect(getMeUseCase.execute).toHaveBeenCalledWith(mockReq.user.userId);
      expect(result).toEqual(mockUser);
    });

    it('deve lançar NotFoundException se o UseCase retornar null', async () => {
      // Arrange
      const mockReq = { user: { userId: 999 } };
      (getMeUseCase.execute as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getMe(mockReq)).rejects.toThrow(NotFoundException);
    });
  });
});