import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('lookup_seal_stages')
export class LookupSealStageEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}