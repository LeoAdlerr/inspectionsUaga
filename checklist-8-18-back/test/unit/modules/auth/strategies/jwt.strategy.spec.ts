import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/modules/auth/strategies/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // Mockamos o ConfigService para retornar um segredo falso
              if (key === 'jwt.secret') {
                return 'test_secret';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('deve ser definido', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('deve validar e retornar o payload do usuário formatado corretamente', async () => {
      // Arrange
      const payload = {
        sub: 1,
        username: 'teste',
        roles: ['ADMIN', 'INSPECTOR'],
      };

      const expectedResult = {
        userId: 1,
        username: 'teste',
        roles: ['ADMIN', 'INSPECTOR'],
      };

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});