import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('jwt.secret');

    if (!secret) {
      throw new Error('A chave secreta JWT (jwt.secret) não está definida na configuração.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Agora passamos a variável 'secret', que o TypeScript sabe que nunca será undefined
      secretOrKey: secret,
    });
  }

  /**
   * O Passport chama este método automaticamente após validar o token com sucesso.
   * O que retornamos aqui será anexado ao objeto `request` como `req.user`.
   * @param payload O payload decodificado do token JWT.
   */
  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      username: payload.username,
      roles: payload.roles 
    };
  }
}