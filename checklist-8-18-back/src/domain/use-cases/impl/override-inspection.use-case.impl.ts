import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { OverrideInspectionUseCase } from '../override-inspection.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { Inspection } from '../../models/inspection.model';
import { OverrideInspectionDto, OverrideDecision } from 'src/api/dtos/override-inspection.dto';

// Constantes de Status
const STATUS_INSPECAO_REPROVADO = 3;          // Entrada (Fila do Documental)
const STATUS_AGUARDANDO_CONFERENCIA = 7;      // Saída (Se já tiver lacres) - [NOVO]
const STATUS_APROVADO_COM_RESSALVAS = 8;      // Saída (Se não tiver lacres)
const STATUS_REPROVADO_POS_AVALIACAO = 12;    // Saída (Reprovação Confirmada)

// Constante Categoria Placa (para validação)
const IMAGE_CATEGORY_PLATE = 1;

@Injectable()
export class OverrideInspectionUseCaseImpl implements OverrideInspectionUseCase {
  private readonly logger = new Logger(OverrideInspectionUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(
    inspectionId: number,
    userId: number,
    dto: OverrideInspectionDto,
  ): Promise<Inspection> {
    this.logger.log(`Avaliação do Documental na inspeção ${inspectionId} (User: ${userId}, Decisão: ${dto.decision})`);

    // 1. Busca a inspeção COM DETALHES (Lacres e Imagens são necessários para a decisão)
    const inspection = await this.inspectionRepository.findByIdWithDetails(inspectionId);
    
    if (!inspection) {
      throw new NotFoundException(`Inspeção com ID "${inspectionId}" não encontrada.`);
    }

    // 2. Validação de Regra de Negócio
    // Só é possível avaliar inspeções que estão na fila de REPROVADOS (3).
    if (inspection.statusId !== STATUS_INSPECAO_REPROVADO) {
      throw new BadRequestException(
        `Apenas inspeções com status REPROVADO (${STATUS_INSPECAO_REPROVADO}) podem ser avaliadas. Status atual: ${inspection.statusId}.`
      );
    }

    // 3. Determina o Novo Status
    let newStatusId: number;
    let actionPrefix: string;

    if (dto.decision === OverrideDecision.APPROVE) {
        // [LÓGICA INTELIGENTE]
        // Verifica se já existem lacres e fotos de placa registrados.
        // Se existirem, significa que a "Lacração Inicial" foi feita enquanto estava reprovado.
        
        const hasSeals = inspection.seals && inspection.seals.length > 0;
        
        // Verifica se tem foto de placa (Categoria 1)
        const hasPlatePhoto = inspection.images && inspection.images.some(img => img.category?.id === IMAGE_CATEGORY_PLATE);

        if (hasSeals || hasPlatePhoto) { 
            // Já tem evidências físicas, pula direto para a fila do Conferente
            newStatusId = STATUS_AGUARDANDO_CONFERENCIA; // 7
            actionPrefix = 'APROVADO COM RESSALVAS (Fluxo Acelerado - Lacres Identificados)';
            this.logger.log(`Inspeção ${inspectionId} possui lacres/fotos. Avançando direto para status 7.`);
        } else {
            // Não tem evidências, vai para o fluxo normal de aguardar lacração
            newStatusId = STATUS_APROVADO_COM_RESSALVAS; // 8
            actionPrefix = 'APROVADO COM RESSALVAS (Aguardando Lacração)';
        }

    } else {
        // Reprovação mantida
        newStatusId = STATUS_REPROVADO_POS_AVALIACAO; // 12
        actionPrefix = 'REPROVAÇÃO MANTIDA';
    }

    // 4. Preparação do Payload (Log de Auditoria no campo actionTaken)
    const timestamp = new Date().toLocaleString('pt-BR');
    const logEntry = `[${timestamp}] [${actionPrefix}] ${dto.justification}`;
    
    const newActionTaken = inspection.actionTaken
      ? `${inspection.actionTaken}\n${logEntry}`
      : logEntry;

    const updatePayload: Partial<Inspection> = {
      statusId: newStatusId,
      actionTaken: newActionTaken,
    };

    // 5. Atualização
    await this.inspectionRepository.update(inspectionId, updatePayload);
    
    this.logger.log(`Inspeção ${inspectionId} movida para status ${newStatusId}.`);

    // 6. Retorno
    const updatedInspection = await this.inspectionRepository.findByIdWithDetails(inspectionId);
    if (!updatedInspection) {
        throw new NotFoundException('Erro ao recuperar a inspeção após a avaliação.');
    }
    
    return updatedInspection;
  }
}