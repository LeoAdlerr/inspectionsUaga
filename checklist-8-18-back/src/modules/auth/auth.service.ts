import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/domain/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    // A única dependência do AuthService é o JwtService para criar o token.
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Gera um access_token para um usuário já validado.
   * @param user O objeto do usuário (que virá da LocalStrategy).
   * @returns Um objeto contendo o access_token JWT.
   */
  async login(user: User) {
    const payload = {
      username: user.username,
      sub: user.id, // 'sub' (subject) é a convenção para o ID do usuário no JWT
      roles: user.roles.map(role => role.name),
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}