import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { UpdateInspectionChecklistItemDto } from '../../../api/dtos/update-inspection-checklist-item.dto';
import { InspectionChecklistItem } from '../../models/inspection-checklist-item.model';
import { UpdateInspectionChecklistItemUseCase } from '../update-inspection-checklist-item.use-case';

const STATUS_EM_INSPECAO = 1;
const STATUS_REPROVADO = 3;      // Permitido apenas para observações
const STATUS_AGUARDANDO_INSPECAO = 4;
const STATUS_N_A = 4; // Status do ITEM (N/A)

@Injectable()
export class UpdateInspectionChecklistItemUseCaseImpl extends UpdateInspectionChecklistItemUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {
    super();
  }

  async execute(
    inspectionId: number,
    pointNumber: number,
    dto: UpdateInspectionChecklistItemDto,
  ): Promise<InspectionChecklistItem> {

    // 1. Busca a inspeção ANTES de tentar atualizar qualquer coisa
    const inspection = await this.inspectionRepository.findById(inspectionId);

    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    // 2. REGRA DE SEGURANÇA (Integridade): 
    // Se inspeção estiver REPROVADA (3), proíbe alterar o julgamento (statusId),
    // mas permite alterar observações.
    if (inspection.statusId === STATUS_REPROVADO && dto.statusId !== undefined && dto.statusId !== null) {
      throw new ForbiddenException(
        'Não é possível alterar o status (Conforme/Não Conforme) dos pontos enquanto a inspeção estiver REPROVADA. Apenas observações são permitidas.'
      );
    }

    // 3. Validação de Status da Inspeção
    // Adicionamos STATUS_REPROVADO na lista de permitidos (com a restrição acima)
    const ALLOWED_STATUSES = [STATUS_EM_INSPECAO, STATUS_AGUARDANDO_INSPECAO, STATUS_REPROVADO];

    if (!ALLOWED_STATUSES.includes(inspection.statusId)) {
      throw new ForbiddenException(
        `Não é permitido alterar itens de uma inspeção finalizada ou em conferência (Status: ${inspection.status?.name || inspection.statusId}).`
      );
    }

    // 4. Executa a atualização
    const updatedItem = await this.inspectionRepository.updateItemByPoint(
      inspectionId,
      pointNumber,
      dto,
    );

    if (!updatedItem) {
      throw new NotFoundException(
        `Item do ponto ${pointNumber} para a inspeção ${inspectionId} não encontrado.`,
      );
    }

    // 5. Lógica de Retrocesso Automático (Legado)
    // Só aplica se inspeção NÃO estiver REPROVADA (pois reprovada não volta pra 'em inspeção' automaticamente)
    if (inspection.statusId !== STATUS_REPROVADO) {
      const inspectionWithItems = await this.inspectionRepository.findByIdWithItems(inspectionId);

      if (inspectionWithItems) {
        const hasNaItem = inspectionWithItems.items.some(item => item.statusId === STATUS_N_A);

        // Se tem item N/A e não está EM_INSPECAO (ex: estava Aguardando), move para EM_INSPECAO
        if (hasNaItem && inspectionWithItems.statusId !== STATUS_EM_INSPECAO) {
          await this.inspectionRepository.update(inspectionId, {
            statusId: STATUS_EM_INSPECAO
          });
        }
      }
    }

    return updatedItem;
  }
}