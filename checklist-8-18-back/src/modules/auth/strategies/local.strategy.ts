import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidateUserUseCase } from 'src/domain/use-cases/validate-user.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    // Injetamos o CONTRATO do nosso Use Case de validação
    @Inject(ValidateUserUseCase)
    private readonly validateUserUseCase: ValidateUserUseCase,
  ) {
    // Dizemos ao Passport que o campo de "username" no DTO de login
    // se chamará 'loginIdentifier'
    super({ usernameField: 'loginIdentifier' });
  }

  /**
   * O Passport chama este método automaticamente com os dados do corpo da requisição.
   */
  async validate(loginIdentifier: string, pass: string): Promise<any> {
    const user = await this.validateUserUseCase.execute(loginIdentifier, pass);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    return user;
  }
}