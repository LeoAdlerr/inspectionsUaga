import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FinalizeInspectionUseCase, FinalizeUploadedFiles } from '../finalize-inspection.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { Inspection } from '../../models/inspection.model';
import { FinalizeInspectionDto } from 'src/api/dtos/finalize-inspection.dto';

// Constantes de Status dos ITENS
const STATUS_ITEM_EM_INSPECAO = 1;
const STATUS_ITEM_CONFORME = 2;
const STATUS_ITEM_NAO_CONFORME = 3;

// Constantes de Status da INSPEÇÃO
const STATUS_INSPECAO_APROVADO = 2;
const STATUS_INSPECAO_REPROVADO = 3;

@Injectable()
export class FinalizeInspectionUseCaseImpl implements FinalizeInspectionUseCase {
  private readonly logger = new Logger(FinalizeInspectionUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystemService: FileSystemPort,
  ) { }

  async execute(
    inspectionId: number,
    dto: FinalizeInspectionDto,
    files: FinalizeUploadedFiles
  ): Promise<Inspection> {

    // 1. BUSCA E VALIDAÇÃO INICIAL
    const inspection = await this.inspectionRepository.findByIdWithItems(inspectionId);
    if (!inspection) {
      throw new NotFoundException(`Inspeção com ID "${inspectionId}" não encontrada.`);
    }
    if (!inspection.items || inspection.items.length === 0) {
      throw new NotFoundException('Itens da inspeção não foram encontrados ou carregados.');
    }

    // 2. VALIDAÇÃO DOS PRÉ-REQUISITOS DE NEGÓCIO
    
    // (A) O checklist foi totalmente preenchido? (Sem pendências)
    const hasPendingItems = inspection.items.some(item => item.statusId === STATUS_ITEM_EM_INSPECAO);
    if (hasPendingItems) {
      throw new BadRequestException('Não é possível finalizar: existem itens pendentes ("EM INSPEÇÃO").');
    }

    // (B) Filtro de "Esforço Mínimo": Bloquear se TUDO for N/A
    const hasActionableItems = inspection.items.some(
      item => item.statusId === STATUS_ITEM_CONFORME || item.statusId === STATUS_ITEM_NAO_CONFORME,
    );
    if (!hasActionableItems) {
      throw new BadRequestException('Não é possível finalizar: A inspeção não pode ter todos os itens como "N/A".');
    }

    // (C) A assinatura do motorista já foi anexada?
    if (!inspection.driverSignaturePath) {
      throw new BadRequestException('Não é possível finalizar: A assinatura do motorista é obrigatória.');
    }

    // --- NOVA VALIDAÇÃO (TASK-FIX-03) ---
    // (D) As medidas verificadas foram preenchidas?
    // Verifica se existem E se são maiores que zero.
    const hasValidLength = inspection.verifiedLength && Number(inspection.verifiedLength) > 0;
    const hasValidWidth = inspection.verifiedWidth && Number(inspection.verifiedWidth) > 0;
    const hasValidHeight = inspection.verifiedHeight && Number(inspection.verifiedHeight) > 0;

    if (!hasValidLength || !hasValidWidth || !hasValidHeight) {
      throw new BadRequestException(
        'Não é possível finalizar: As medidas verificadas (Comprimento, Largura, Altura) são obrigatórias e devem ser maiores que zero.'
      );
    }
    let newStatusId: number;

    const hasNonConformity = inspection.items.some(
      (item) => item.statusId === STATUS_ITEM_NAO_CONFORME
    );

    if (hasNonConformity) {
      newStatusId = STATUS_INSPECAO_REPROVADO; // 3
      this.logger.warn(`Inspeção ${inspectionId} contém itens Não Conformes -> Status: REPROVADO`);
    } else {
      newStatusId = STATUS_INSPECAO_APROVADO; // 2
      this.logger.log(`Inspeção ${inspectionId} aprovada (Conforme/NA) -> Status: APROVADO`);
    }

    // 4. PREPARAÇÃO DO PAYLOAD E ATUALIZAÇÃO
    const updatePayload: Partial<Inspection> = {
      statusId: newStatusId,
      endDatetime: new Date(), // Marca o fim do checklist
    };

    await this.inspectionRepository.update(inspectionId, updatePayload);

    // 5. RETORNO
    const updatedInspection = await this.inspectionRepository.findByIdWithDetails(inspectionId);
    if (!updatedInspection) {
      throw new NotFoundException(`Erro ao recuperar inspeção ${inspectionId} após atualização.`);
    }

    return updatedInspection;
  }
}