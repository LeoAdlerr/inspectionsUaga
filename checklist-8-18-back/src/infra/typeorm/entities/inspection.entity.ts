import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { InspectionChecklistItemEntity } from './inspection-checklist-item.entity';
import { InspectionSealEntity } from './inspection-seal.entity';
import { InspectionImageEntity } from './inspection-image.entity';

import { LookupStatusEntity } from './lookup-status.entity';
import { LookupModalityEntity } from './lookup-modality.entity';
import { LookupOperationTypeEntity } from './lookup-operation-type.entity';
import { LookupUnitTypeEntity } from './lookup-unit-type.entity';
import { LookupContainerTypeEntity } from './lookup-container-type.entity';
import { LookupSealVerificationStatusEntity } from './lookup-seal-verification-status.entity';
import { UserEntity } from './user.entity';

@Entity('inspections')
export class InspectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // --- IDs de Usuário ---
  @Column({ name: 'inspector_id', nullable: true })
  inspectorId: number;

  @Column({ name: 'conferente_id', nullable: true })
  conferenteId: number;

  // [NOVO] Usuário da Portaria que liberou a saída
  @Column({ name: 'gate_operator_id', nullable: true })
  gateOperatorId: number;

  // --- Status ---
  @Column({ name: 'status_id' })
  statusId: number;

  @ManyToOne(() => LookupStatusEntity, { eager: true })
  @JoinColumn({ name: 'status_id' })
  status: LookupStatusEntity;

  // --- Dados da Carga ---
  @Column({ name: 'entry_registration', length: 100 })
  entryRegistration: string;

  @Column({ name: 'vehicle_plates', length: 20 })
  vehiclePlates: string;

  @Column({ name: 'transport_document', length: 100, nullable: true })
  transportDocument: string;

  @Column({ name: 'modality_id' })
  modalityId: number;

  @ManyToOne(() => LookupModalityEntity, { eager: true })
  @JoinColumn({ name: 'modality_id' })
  modality: LookupModalityEntity;

  @Column({ name: 'operation_type_id' })
  operationTypeId: number;

  @ManyToOne(() => LookupOperationTypeEntity, { eager: true })
  @JoinColumn({ name: 'operation_type_id' })
  operationType: LookupOperationTypeEntity;

  @Column({ name: 'unit_type_id' })
  unitTypeId: number;

  @ManyToOne(() => LookupUnitTypeEntity, { eager: true })
  @JoinColumn({ name: 'unit_type_id' })
  unitType: LookupUnitTypeEntity;

  @Column({ name: 'container_type_id', nullable: true })
  containerTypeId: number;

  @ManyToOne(() => LookupContainerTypeEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'container_type_id' })
  containerType: LookupContainerTypeEntity;

  @Column({ name: 'container_number', length: 20, nullable: true })
  containerNumber: string;

  @Column({ name: 'has_precinto', type: 'tinyint', width: 1, default: 0 })
  hasPrecinto: boolean;

  // --- Medidas ---
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'verified_length', nullable: true })
  verifiedLength: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'verified_width', nullable: true })
  verifiedWidth: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'verified_height', nullable: true })
  verifiedHeight: number;

  // --- Timestamps de Fluxo ---
  @Column({ name: 'start_datetime' })
  startDatetime: Date;

  @Column({ name: 'inspection_started_at', nullable: true })
  inspectionStartedAt: Date;

  @Column({ name: 'end_datetime', nullable: true })
  endDatetime: Date;

  @Column({ name: 'conference_started_at', nullable: true })
  conferenceStartedAt: Date;

  @Column({ name: 'conference_ended_at', nullable: true })
  conferenceEndedAt: Date;

  // --- Timestamp Exclusivo da Portaria ---
  @Column({ name: 'gate_out_at', type: 'datetime', nullable: true })
  gateOutAt: Date;

  // --- Motorista ---
  @Column({ name: 'driver_name', length: 255 })
  driverName: string;

  @Column({ name: 'driver_signature_path', length: 512, nullable: true })
  driverSignaturePath: string;

  // --- Assinaturas ---
  @Column({ name: 'inspector_signature_path', length: 512, nullable: true })
  inspectorSignaturePath: string;

  // --- Lacres Fiscais (Mantidos no DDL) ---
  @Column({ name: 'seal_shipper', length: 100, nullable: true })
  sealShipper: string;

  @Column({ name: 'seal_rfb', length: 100, nullable: true })
  sealRfb: string;

  // --- Verificação de Saída (Portaria) ---
  @Column({ name: 'seal_verification_rfb_status_id', nullable: true })
  sealVerificationRfbStatusId: number;

  @ManyToOne(() => LookupSealVerificationStatusEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'seal_verification_rfb_status_id' })
  sealVerificationRfbStatus: LookupSealVerificationStatusEntity;

  @Column({ name: 'seal_verification_shipper_status_id', nullable: true })
  sealVerificationShipperStatusId: number;

  @ManyToOne(() => LookupSealVerificationStatusEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'seal_verification_shipper_status_id' })
  sealVerificationShipperStatus: LookupSealVerificationStatusEntity;

  @Column({ name: 'seal_verification_tape_status_id', nullable: true })
  sealVerificationTapeStatusId: number;

  @ManyToOne(() => LookupSealVerificationStatusEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'seal_verification_tape_status_id' })
  sealVerificationTapeStatus: LookupSealVerificationStatusEntity;

  @Column({ name: 'seal_verification_responsible_name', length: 255, nullable: true })
  sealVerificationResponsibleName: string;

  @Column({ name: 'seal_verification_signature_path', length: 512, nullable: true })
  sealVerificationSignaturePath: string;

  @Column({ name: 'seal_verification_date', type: 'date', nullable: true })
  sealVerificationDate: Date;

  // --- Campos Gerais ---
  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ name: 'action_taken', type: 'text', nullable: true })
  actionTaken: string;

  @Column({ name: 'generated_pdf_path', length: 512, nullable: true })
  generatedPdfPath: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Relações ---
  @OneToMany(() => InspectionChecklistItemEntity, item => item.inspection, {
    cascade: true,
  })
  items: InspectionChecklistItemEntity[];

  @OneToMany(() => InspectionSealEntity, seal => seal.inspection, {
    cascade: true,
  })
  seals: InspectionSealEntity[];

  @OneToMany(() => InspectionImageEntity, image => image.inspection, {
    cascade: true,
  })
  images: InspectionImageEntity[];

  @ManyToOne(() => UserEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'inspector_id' })
  inspector: UserEntity;

  @ManyToOne(() => UserEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'conferente_id' })
  conferente: UserEntity;

  @ManyToOne(() => UserEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'gate_operator_id' })
  gateOperator: UserEntity;
}