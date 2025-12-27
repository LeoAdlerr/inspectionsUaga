import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('lookup_image_categories')
export class LookupImageCategoryEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}