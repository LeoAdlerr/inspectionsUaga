import { SetMetadata } from '@nestjs/common';
import { RoleName } from 'src/domain/models/role.model'; // Importamos o nosso novo Enum

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);