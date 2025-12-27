// Adicionamos um Enum para os nomes das Roles, para uso seguro no código
export enum RoleName {
  ADMIN = 'ADMIN',
  DOCUMENTAL = 'DOCUMENTAL',
  INSPECTOR = 'INSPECTOR',
  CONFERENTE = 'CONFERENTE',
  PORTARIA = 'PORTARIA',
}

export class Role {
  id: number;
  name: RoleName; // A propriedade 'name' agora usa o Enum
}