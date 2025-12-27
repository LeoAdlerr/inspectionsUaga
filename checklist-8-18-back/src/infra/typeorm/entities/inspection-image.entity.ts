import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { InspectionEntity } from './inspection.entity';
import { LookupImageCategoryEntity } from './lookup-image-category.entity';

@Entity('inspection_images')
export class InspectionImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inspection_id' })
  inspectionId: number;

  @ManyToOne(() => InspectionEntity, (inspection) => inspection.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inspection_id' })
  inspection: InspectionEntity;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => LookupImageCategoryEntity, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: LookupImageCategoryEntity;

  @Column({ type: 'varchar', name: 'photo_path', length: 512 })
  photoPath: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}