import { Role } from './role.model';

export class User {
  id: number;
  fullName: string;
  username: string;
  email?: string;
  isActive: boolean;
  signaturePath?: string | null;
  
  roles: Role[];
}