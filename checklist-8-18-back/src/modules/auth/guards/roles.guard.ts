import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleName } from 'src/domain/models/role.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Se não há roles definidas na rota, permite o acesso
    }
    
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) {
        return false; // Se o usuário não existe ou não tem roles, nega o acesso
    }

    // Comparamos o array de nomes de roles requeridas (ex: ['ADMIN'])
    // com o array de nomes de roles que o usuário possui (extraído do payload do JWT)
    return requiredRoles.some((roleName) => user.roles?.includes(roleName));
  }
}