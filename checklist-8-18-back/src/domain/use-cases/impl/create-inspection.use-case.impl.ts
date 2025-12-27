import { Inject, Injectable } from '@nestjs/common';
import { CreateInspectionUseCase } from '../create-inspection.use-case';
import { Inspection } from '../../models/inspection.model';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { CreateInspectionDto } from '../../../api/dtos/create-inspection.dto';
import { MasterInspectionPointRepositoryPort } from '../../repositories/master-inspection-point.repository.port';
import { InspectionChecklistItem } from '../../models/inspection-checklist-item.model';

const STATUS_AGUARDANDO_INSPECAO = 4;

@Injectable()
export class CreateInspectionUseCaseImpl implements CreateInspectionUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(MasterInspectionPointRepositoryPort)
    private readonly masterPointRepository: MasterInspectionPointRepositoryPort,
  ) { }

  async execute(dto: CreateInspectionDto): Promise<Inspection> {
    // 2. A busca de pontos (11 ou 18) continua a mesma
    const masterPoints = await this.masterPointRepository.findForModality(dto.modalityId);

    const checklistItems: Partial<InspectionChecklistItem>[] = masterPoints.map(point => ({
      masterPointId: point.id,
      statusId: 1, 
    }));

    const newInspectionData: Partial<Inspection> = {
      ...dto,
      statusId: STATUS_AGUARDANDO_INSPECAO, 
      startDatetime: new Date(),
      items: checklistItems as InspectionChecklistItem[],
    };

    return this.inspectionRepository.create(newInspectionData);
  }
}
