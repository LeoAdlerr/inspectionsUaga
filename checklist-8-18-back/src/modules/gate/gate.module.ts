import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Módulos de Infraestrutura
import { PdfModule } from '../../infra/pdf/pdf.module';
import { FileSystemModule } from '../../infra/file-system/file-system.module';

// Controller
import { GateController } from '../../api/controllers/gate.controller';

// Use Cases da Portaria
import { GetGateQueueUseCase } from '../../domain/use-cases/get-gate-queue.use-case';
import { GetGateQueueUseCaseImpl } from '../../domain/use-cases/impl/get-gate-queue.use-case.impl';
import { RegisterGateExitUseCase } from '../../domain/use-cases/register-gate-exit.use-case';
import { RegisterGateExitUseCaseImpl } from '../../domain/use-cases/impl/register-gate-exit.use-case.impl';

//  Novo Use Case de Rejeição (Já deixamos preparado)
import { RejectGateInspectionUseCase } from '../../domain/use-cases/reject-gate-inspection.use-case';
import { RejectGateInspectionUseCaseImpl } from '../../domain/use-cases/impl/reject-gate-inspection.use-case.impl';

// Use Case Auxiliar (Para gerar PDF na saída)
import { GenerateInspectionReportUseCase } from '../../domain/use-cases/generate-inspection-report.use-case';
import { GenerateInspectionReportUseCaseImpl } from '../../domain/use-cases/impl/generate-inspection-report.use-case.impl';

// Repositórios e Interfaces
import { InspectionRepositoryPort } from '../../domain/repositories/inspection.repository.port';
import { InspectionRepository } from '../../infra/typeorm/repositories/inspection.repository';

// Entidades (Necessárias para o InspectionRepository funcionar neste contexto)
import { InspectionEntity } from '../../infra/typeorm/entities/inspection.entity';
import { InspectionChecklistItemEntity } from '../../infra/typeorm/entities/inspection-checklist-item.entity';
import { ItemEvidenceEntity } from '../../infra/typeorm/entities/item-evidence.entity';
import { InspectionSealEntity } from '../../infra/typeorm/entities/inspection-seal.entity';
import { InspectionImageEntity } from '../../infra/typeorm/entities/inspection-image.entity';

@Module({
    imports: [
        // Registra as entidades necessárias para o Repositório de Inspeção
        TypeOrmModule.forFeature([
            InspectionEntity,
            InspectionChecklistItemEntity,
            ItemEvidenceEntity,
            InspectionSealEntity,
            InspectionImageEntity,
        ]),
        PdfModule,
        FileSystemModule,
    ],
    controllers: [
        GateController
    ],
    providers: [
        // Repositório
        {
            provide: InspectionRepositoryPort,
            useClass: InspectionRepository
        },

        // Use Cases
        { provide: GetGateQueueUseCase, useClass: GetGateQueueUseCaseImpl },
        { provide: RegisterGateExitUseCase, useClass: RegisterGateExitUseCaseImpl },
        { provide: RejectGateInspectionUseCase, useClass: RejectGateInspectionUseCaseImpl }, // Novo
        { provide: GenerateInspectionReportUseCase, useClass: GenerateInspectionReportUseCaseImpl },
    ],
})
export class GateModule { }