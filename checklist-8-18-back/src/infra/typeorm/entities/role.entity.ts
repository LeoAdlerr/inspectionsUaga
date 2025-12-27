import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relação (apenas para o TypeORM, não cria coluna no banco)
  @ManyToMany(() => UserEntity, user => user.roles)
  users: UserEntity[];
}