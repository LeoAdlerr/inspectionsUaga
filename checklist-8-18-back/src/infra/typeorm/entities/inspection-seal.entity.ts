import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { InspectionEntity } from './inspection.entity';
import { LookupSealStageEntity } from './lookup-seal-stage.entity';
// [NOVO] Importar a entidade de status de verificação
import { LookupSealVerificationStatusEntity } from './lookup-seal-verification-status.entity';

@Entity('inspection_seals')
export class InspectionSealEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inspection_id' })
  inspectionId: number;

  @ManyToOne(() => InspectionEntity, (inspection) => inspection.seals, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inspection_id' })
  inspection: InspectionEntity;

  @Column({ name: 'seal_number', length: 100 })
  sealNumber: string;

  @Column({ name: 'stage_id' })
  stageId: number;

  @ManyToOne(() => LookupSealStageEntity, { eager: true })
  @JoinColumn({ name: 'stage_id' })
  stage: LookupSealStageEntity;

  @Column({ type: 'varchar', name: 'photo_path', length: 512, nullable: true })
  photoPath: string | null;

  // Status da verificação individual (Portaria)
  @Column({ name: 'verification_status_id', nullable: true })
  verificationStatusId: number | null;

  // Relação com Lookup de Status
  @ManyToOne(() => LookupSealVerificationStatusEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'verification_status_id' })
  verificationStatus: LookupSealVerificationStatusEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}