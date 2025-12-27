import { Inject, Injectable } from '@nestjs/common';
import { GetGateQueueUseCase } from '../get-gate-queue.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { GateQueueItemDto } from 'src/api/dtos/gate-queue-item.dto';

const STATUS_AGUARDANDO_SAIDA = 13;
const STAGE_RFB = 4;
const STAGE_ARMADOR = 5;

@Injectable()
export class GetGateQueueUseCaseImpl implements GetGateQueueUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(): Promise<GateQueueItemDto[]> {
    // Busca inspeções filtradas por status (13) já trazendo os lacres (seals)
    const inspections = await this.inspectionRepository.findByStatus(STATUS_AGUARDANDO_SAIDA);

    return inspections.map(inspection => {
      // Encontra o lacre RFB na lista de lacres da inspeção
      const rfbSeal = inspection.seals?.find(
        s => s.stage?.id === STAGE_RFB || s.stageId === STAGE_RFB
      );
      
      // Encontra o lacre do Armador na lista
      const armadorSeal = inspection.seals?.find(
        s => s.stage?.id === STAGE_ARMADOR || s.stageId === STAGE_ARMADOR
      );

      // Mapeia para o DTO simplificado da Portaria
      return {
        id: inspection.id,
        vehiclePlates: inspection.vehiclePlates,
        containerNumber: inspection.containerNumber,
        driverName: inspection.driverName,
        rfbSeal: rfbSeal ? rfbSeal.sealNumber : 'N/A',
        armadorSeal: armadorSeal ? armadorSeal.sealNumber : 'N/A',
        // Usamos updatedAt como referência de quando entrou na fila (momento que a RFB liberou)
        releasedAt: inspection.updatedAt 
      };
    });
  }
}