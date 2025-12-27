import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/modules/auth/auth.service';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('deve gerar um access_token com o payload correto', async () => {
      // Arrange
      // ✅ CORREÇÃO: Removemos a propriedade 'passwordHash' do mockUser,
      // pois o AuthService recebe um objeto User limpo.
      const user: User = {
        id: 1,
        username: 'teste',
        fullName: 'Usuário de Teste',
        email: 'teste@teste.com',
        isActive: true,
        roles: [{ id: 1, name: RoleName.ADMIN }] as Role[],
      };
      
      const expectedToken = 'fake-jwt-token';
      (jwtService.sign as jest.Mock).mockReturnValue(expectedToken);

      // Act
      const result = await service.login(user);

      // Assert
      const expectedPayload = {
        username: user.username,
        sub: user.id,
        roles: ['ADMIN'],
      };
      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual({ access_token: expectedToken });
    });
  });
});