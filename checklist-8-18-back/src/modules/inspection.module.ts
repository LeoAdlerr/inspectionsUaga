import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfModule } from '../infra/pdf/pdf.module';
import { InspectionController } from '../api/controllers/inspection.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';

// pipes
import { EmptyBodyValidationPipe } from '../api/pipes/empty-body-validation.pipe';

// Importação do novo módulo centralizado
import { FileSystemModule } from '../infra/file-system/file-system.module';

// --- CONTROLLERS ---
import { GateController } from '../api/controllers/gate.controller';

// Use Cases (Interfaces e Implementações)
import { CreateInspectionUseCase } from '../domain/use-cases/create-inspection.use-case';
import { CreateInspectionUseCaseImpl } from '../domain/use-cases/impl/create-inspection.use-case.impl';
import { UpdateInspectionChecklistItemUseCase } from '../domain/use-cases/update-inspection-checklist-item.use-case';
import { UpdateInspectionChecklistItemUseCaseImpl } from '../domain/use-cases/impl/update-inspection-checklist-item.use-case.impl';
import { UploadEvidenceUseCase } from '../domain/use-cases/upload-evidence.use-case';
import { UploadEvidenceUseCaseImpl } from '../domain/use-cases/impl/upload-evidence.use-case.impl';
import { FinalizeInspectionUseCase } from '../domain/use-cases/finalize-inspection.use-case';
import { FinalizeInspectionUseCaseImpl } from '../domain/use-cases/impl/finalize-inspection.use-case.impl';
import { FindAllInspectionsUseCase } from '../domain/use-cases/find-all-inspections.use-case';
import { FindAllInspectionsUseCaseImpl } from '../domain/use-cases/impl/find-all-inspections.use-case.impl';
import { FindInspectionByIdUseCase } from '../domain/use-cases/find-inspection-by-id.use-case';
import { FindInspectionByIdUseCaseImpl } from '../domain/use-cases/impl/find-inspection-by-id.use-case.impl';
import { GenerateInspectionReportUseCase } from '../domain/use-cases/generate-inspection-report.use-case';
import { GenerateInspectionReportUseCaseImpl } from '../domain/use-cases/impl/generate-inspection-report.use-case.impl';
import { CheckForExistingInspectionUseCase } from '../domain/use-cases/check-for-existing-inspection.use-case';
import { CheckForExistingInspectionUseCaseImpl } from '../domain/use-cases/impl/check-for-existing-inspection.use-case.impl';
import { UpdateInspectionUseCase } from '../domain/use-cases/update-inspection.use-case';
import { UpdateInspectionUseCaseImpl } from '../domain/use-cases/impl/update-inspection.use-case.impl';
import { DeleteInspectionUseCase } from '../domain/use-cases/delete-inspection.use-case';
import { DeleteInspectionUseCaseImpl } from '../domain/use-cases/impl/delete-inspection.use-case.impl';
import { DeleteEvidenceUseCase } from '../domain/use-cases/delete-evidence.use-case';
import { DeleteEvidenceUseCaseImpl } from '../domain/use-cases/impl/delete-evidence.use-case.impl';
import { DownloadEvidenceUseCase } from '@domain/use-cases/download-evidence.use-case';
import { DownloadEvidenceUseCaseImpl } from '@domain/use-cases/impl/download-evidence.use-case.impl';
import { AttachSignaturesUseCase } from '../domain/use-cases/attach-signatures.use-case';
import { AttachSignaturesUseCaseImpl } from '@domain/use-cases/impl/attach-signatures.use-case.impl';
import { AssignInspectionUseCase } from '../domain/use-cases/assign-inspection.use-case';
import { AssignInspectionUseCaseImpl } from '../domain/use-cases/impl/assign-inspection.use-case.impl';
import { AttachDriverSignatureUseCase } from '../domain/use-cases/attach-driver-signature.use-case';
import { AttachDriverSignatureUseCaseImpl } from '../domain/use-cases/impl/attach-driver-signature.use-case.impl';
import { OverrideInspectionUseCase } from '../domain/use-cases/override-inspection.use-case';
import { OverrideInspectionUseCaseImpl } from '../domain/use-cases/impl/override-inspection.use-case.impl';
import { SealInitialUseCase } from '../domain/use-cases/seal-initial.use-case';
import { SealInitialUseCaseImpl } from '../domain/use-cases/impl/seal-initial.use-case.impl';
import { DeleteInspectionImageUseCase } from '../domain/use-cases/delete-inspection-image.use-case';
import { DeleteInspectionImageUseCaseImpl } from '../domain/use-cases/impl/delete-inspection-image.use-case.impl';
import { DeleteSealUseCase } from '../domain/use-cases/delete-seal.use-case';
import { DeleteSealUseCaseImpl } from '../domain/use-cases/impl/delete-seal.use-case.impl';
import { UpdateSealUseCase } from '../domain/use-cases/update-seal.use-case';
import { UpdateSealUseCaseImpl } from '../domain/use-cases/impl/update-seal.use-case.impl';
import { UpdateInspectionImageUseCase } from '../domain/use-cases/update-inspection-image.use-case';
import { UpdateInspectionImageUseCaseImpl } from '../domain/use-cases/impl/update-inspection-image.use-case.impl';
import { StartLoadingUseCase } from '../domain/use-cases/start-loading.use-case';
import { StartLoadingUseCaseImpl } from '../domain/use-cases/impl/start-loading.use-case.impl';
import { FinishLoadingUseCase } from '../domain/use-cases/finish-loading.use-case';
import { FinishLoadingUseCaseImpl } from '../domain/use-cases/impl/finish-loading.use-case.impl';
import { DeleteConferenceImageUseCase } from '../domain/use-cases/delete-conference-image.use-case';
import { DeleteConferenceImageUseCaseImpl } from '../domain/use-cases/impl/delete-conference-image.use-case.impl';
import { DeleteConferenceSealUseCase } from '../domain/use-cases/delete-conference-seal.use-case';
import { DeleteConferenceSealUseCaseImpl } from '../domain/use-cases/impl/delete-conference-seal.use-case.impl';
import { UpdateConferenceImageUseCase } from '../domain/use-cases/update-conference-image.use-case';
import { UpdateConferenceImageUseCaseImpl } from '../domain/use-cases/impl/update-conference-image.use-case.impl';
import { UpdateConferenceSealUseCase } from '../domain/use-cases/update-conference-seal.use-case';
import { UpdateConferenceSealUseCaseImpl } from '../domain/use-cases/impl/update-conference-seal.use-case.impl';
import { AddRfbSealUseCase } from '../domain/use-cases/add-rfb-seal.use-case';
import { AddRfbSealUseCaseImpl } from '../domain/use-cases/impl/add-rfb-seal.use-case.impl';

// Ports e Repositories
import { InspectionRepositoryPort } from '../domain/repositories/inspection.repository.port';
import { InspectionRepository } from '../infra/typeorm/repositories/inspection.repository';
import { MasterInspectionPointRepositoryPort } from '../domain/repositories/master-inspection-point.repository.port';
import { MasterInspectionPointRepository } from '../infra/typeorm/repositories/master-inspection-point.repository';
import { FileSystemPort } from '../domain/ports/file-system.port';

// Entidades do TypeORM
import { InspectionEntity } from '../infra/typeorm/entities/inspection.entity';
import { InspectionChecklistItemEntity } from '../infra/typeorm/entities/inspection-checklist-item.entity';
import { ItemEvidenceEntity } from '../infra/typeorm/entities/item-evidence.entity';
import { MasterInspectionPointEntity } from '../infra/typeorm/entities/master-inspection-point.entity';
import { LookupChecklistItemStatusEntity } from '../infra/typeorm/entities/lookup-checklist-item-status.entity';
import { LookupModalityEntity } from '../infra/typeorm/entities/lookup-modality.entity';
import { LookupOperationTypeEntity } from '../infra/typeorm/entities/lookup-operation-type.entity';
import { LookupSealVerificationStatusEntity } from '../infra/typeorm/entities/lookup-seal-verification-status.entity';
import { LookupContainerTypeEntity } from '../infra/typeorm/entities/lookup-container-type.entity';
import { LookupUnitTypeEntity } from '../infra/typeorm/entities/lookup-unit-type.entity';
import { LookupStatusEntity } from '../infra/typeorm/entities/lookup-status.entity';
import { InspectionSealEntity } from '../infra/typeorm/entities/inspection-seal.entity';
import { InspectionImageEntity } from '../infra/typeorm/entities/inspection-image.entity';
import { LookupSealStageEntity } from '../infra/typeorm/entities/lookup-seal-stage.entity';
import { LookupImageCategoryEntity } from '../infra/typeorm/entities/lookup-image-category.entity';
import { UsersModule } from './users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InspectionEntity,
      InspectionChecklistItemEntity,
      ItemEvidenceEntity,
      MasterInspectionPointEntity,
      LookupChecklistItemStatusEntity,
      LookupModalityEntity,
      LookupOperationTypeEntity,
      LookupSealVerificationStatusEntity,
      LookupContainerTypeEntity,
      LookupUnitTypeEntity,
      LookupStatusEntity,
      InspectionSealEntity,
      InspectionImageEntity,
      LookupSealStageEntity,
      LookupImageCategoryEntity,
    ]),
    PdfModule,
    FileSystemModule,
    UsersModule,
    MulterModule.registerAsync({
      imports: [FileSystemModule],
      useFactory: async (fsService: FileSystemPort) => {
        const tempDir = path.join(process.cwd(), 'uploads', 'tmp');
        await fsService.createDirectoryIfNotExists(tempDir);
        return {
          dest: tempDir,
          fileFilter: (req, file, cb) => {
            if (file.mimetype && file.mimetype.startsWith('image/')) {
              cb(null, true);
            } else {
              cb(null, false);
            }
          },
          limits: { fileSize: 5 * 1024 * 1024 },
        };
      },
      inject: [FileSystemPort],
    }),
  ],
  controllers: [
    InspectionController,
  ],
  providers: [
    { provide: CreateInspectionUseCase, useClass: CreateInspectionUseCaseImpl },
    { provide: UpdateInspectionChecklistItemUseCase, useClass: UpdateInspectionChecklistItemUseCaseImpl },
    { provide: UploadEvidenceUseCase, useClass: UploadEvidenceUseCaseImpl },
    { provide: FinalizeInspectionUseCase, useClass: FinalizeInspectionUseCaseImpl },
    { provide: FindAllInspectionsUseCase, useClass: FindAllInspectionsUseCaseImpl },
    { provide: FindInspectionByIdUseCase, useClass: FindInspectionByIdUseCaseImpl },
    { provide: GenerateInspectionReportUseCase, useClass: GenerateInspectionReportUseCaseImpl },
    { provide: CheckForExistingInspectionUseCase, useClass: CheckForExistingInspectionUseCaseImpl },
    { provide: InspectionRepositoryPort, useClass: InspectionRepository },
    { provide: MasterInspectionPointRepositoryPort, useClass: MasterInspectionPointRepository },
    { provide: UpdateInspectionUseCase, useClass: UpdateInspectionUseCaseImpl },
    { provide: DeleteInspectionUseCase, useClass: DeleteInspectionUseCaseImpl },
    { provide: DeleteEvidenceUseCase, useClass: DeleteEvidenceUseCaseImpl },
    { provide: DownloadEvidenceUseCase, useClass: DownloadEvidenceUseCaseImpl },
    { provide: AttachSignaturesUseCase, useClass: AttachSignaturesUseCaseImpl },
    { provide: AssignInspectionUseCase, useClass: AssignInspectionUseCaseImpl },
    { provide: AttachDriverSignatureUseCase, useClass: AttachDriverSignatureUseCaseImpl },
    { provide: OverrideInspectionUseCase, useClass: OverrideInspectionUseCaseImpl },
    { provide: SealInitialUseCase, useClass: SealInitialUseCaseImpl },
    { provide: DeleteSealUseCase, useClass: DeleteSealUseCaseImpl },
    { provide: DeleteInspectionImageUseCase, useClass: DeleteInspectionImageUseCaseImpl },
    { provide: UpdateSealUseCase, useClass: UpdateSealUseCaseImpl },
    { provide: UpdateInspectionImageUseCase, useClass: UpdateInspectionImageUseCaseImpl },
    { provide: StartLoadingUseCase, useClass: StartLoadingUseCaseImpl },
    { provide: FinishLoadingUseCase, useClass: FinishLoadingUseCaseImpl },
    { provide: UpdateConferenceImageUseCase, useClass: UpdateConferenceImageUseCaseImpl },
    { provide: UpdateConferenceSealUseCase, useClass: UpdateConferenceSealUseCaseImpl },
    { provide: DeleteConferenceImageUseCase, useClass: DeleteConferenceImageUseCaseImpl },
    { provide: DeleteConferenceSealUseCase, useClass: DeleteConferenceSealUseCaseImpl },
    { provide: AddRfbSealUseCase, useClass: AddRfbSealUseCaseImpl },

    EmptyBodyValidationPipe,
  ],
})
export class InspectionModule { }