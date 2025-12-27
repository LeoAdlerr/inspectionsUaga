import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AssignInspectionUseCase } from '../assign-inspection.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { Inspection } from '../../models/inspection.model';

// IDs dos Status
const STATUS_AGUARDANDO_INSPECAO = 4;
const STATUS_EM_INSPECAO = 1;

@Injectable()
export class AssignInspectionUseCaseImpl implements AssignInspectionUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(inspectionId: number, inspectorId: number): Promise<Inspection> {
    // 1. Busca a inspeção (o findById já carrega as relações 'eager' como o status)
    const inspection = await this.inspectionRepository.findById(inspectionId);

    if (!inspection) {
      throw new NotFoundException(`Inspeção com ID "${inspectionId}" não encontrada.`);
    }

    // 2. Regra de Negócio: Verifica se a inspeção já foi assumida
    if (inspection.inspectorId) {
        throw new BadRequestException('Esta inspeção já foi atribuída a um inspetor.');
    }

    // 3. Regra de Negócio: Verifica se a inspeção está no status correto
    if (inspection.statusId !== STATUS_AGUARDANDO_INSPECAO) {
        // Adicionamos uma verificação segura (optional chaining)
        const statusName = inspection.status?.name || 'Desconhecido';
        throw new BadRequestException(`A inspeção não está no status "Aguardando Inspeção". Status atual: ${statusName}`);
    }

    // 4. Atualiza a inspeção
    await this.inspectionRepository.update(inspectionId, {
      inspectorId: inspectorId,
      statusId: STATUS_EM_INSPECAO,
    });

    // 5. Retorna a inspeção atualizada
    const updatedInspection = await this.inspectionRepository.findById(inspectionId);
    
    //  Verificamos se a inspeção foi encontrada após o update
    if (!updatedInspection) {
        throw new NotFoundException(`Falha ao buscar a inspeção com ID ${inspectionId} após a atribuição.`);
    }
    
    return updatedInspection;
  }
}