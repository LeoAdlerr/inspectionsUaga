import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { RejectGateInspectionUseCase } from '../reject-gate-inspection.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { Inspection } from '../../models/inspection.model';
import { RejectGateDto, GateRejectionReason } from 'src/api/dtos/reject-gate.dto';
import { FileSystemPort } from 'src/domain/ports/file-system.port'; // [NOVO]

const STATUS_AGUARDANDO_SAIDA = 13;
const STATUS_CORRECAO_DOCUMENTAL = 14;
const STATUS_AGUARDANDO_LACRACAO = 9; // Volta para etapa RFB

// Categoria para salvar a foto de rejeição (ex: OTHER ou criar uma específica)
const CATEGORY_REJECTION_EVIDENCE = 4; 

@Injectable()
export class RejectGateInspectionUseCaseImpl implements RejectGateInspectionUseCase {
  private readonly logger = new Logger(RejectGateInspectionUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort) // Injeção do FileSystem
    private readonly fileSystem: FileSystemPort,
  ) {}

  // Assinatura atualizada para receber o arquivo (opcional)
  async execute(
    inspectionId: number, 
    userId: number, 
    dto: RejectGateDto, 
    file?: Express.Multer.File 
  ): Promise<Inspection> {
    this.logger.log(`Processando rejeição (Gate) para inspeção ${inspectionId}. Motivo: ${dto.reason}`);

    // 1. Validação de Regra de Negócio: Lacre Divergente EXIGE Foto
    if (dto.reason === GateRejectionReason.SEAL_DIVERGENCE && !file) {
      throw new BadRequestException(
        'Para rejeição por Divergência de Lacre, é obrigatório enviar uma foto de evidência.'
      );
    }

    // 2. Busca Inspeção
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);

    // 3. Valida Status Atual
    if (inspection.statusId !== STATUS_AGUARDANDO_SAIDA) {
      throw new BadRequestException(`Status inválido para rejeição: ${inspection.statusId}`);
    }

    // 4. Lógica de Decisão de Status
    let newStatusId: number;
    let logMessage = '';

    switch (dto.reason) {
      case GateRejectionReason.WRONG_DATA:
        newStatusId = STATUS_CORRECAO_DOCUMENTAL; // 14
        logMessage = 'REJEIÇÃO (ERRO CADASTRAL) - Enviado para Correção';
        break;
      
      case GateRejectionReason.SEAL_DIVERGENCE:
        newStatusId = STATUS_AGUARDANDO_LACRACAO; // 9 (Volta para RFB)
        logMessage = 'REJEIÇÃO (DIVERGÊNCIA LACRE) - Retornado para Relacração';
        break;

      default:
        throw new BadRequestException('Motivo desconhecido.');
    }

    // 5. Processamento da Foto (Se houver)
    if (file && dto.reason === GateRejectionReason.SEAL_DIVERGENCE) {
      try {
        const directory = `inspections/${inspectionId}/rejections`;
        const fileName = `rejection_evidence_${Date.now()}.jpg`;
        
        // Salva no disco/S3
        const savedPath = await this.fileSystem.saveFile(
            directory, 
            fileName, 
            file.buffer, 
            file.mimetype
        );

        // Salva referência no banco (Tabela inspection_images)
        await this.inspectionRepository.addImage({
            inspectionId: inspectionId,
            categoryId: CATEGORY_REJECTION_EVIDENCE,
            photoPath: savedPath,
            description: `Evidência de Rejeição na Portaria: ${dto.observation || 'Sem obs'}`
        });

        logMessage += ` | Foto de evidência salva.`;

      } catch (error) {
        this.logger.error(`Erro ao salvar foto de rejeição: ${error.message}`);
        throw new InternalServerErrorException('Falha ao processar evidência de rejeição.');
      }
    }

    // 6. Atualiza Histórico e Status
    const timestamp = new Date().toLocaleString('pt-BR');
    const userObservation = dto.observation ? ` - Obs: ${dto.observation}` : '';
    const newActionTaken = inspection.actionTaken 
      ? `${inspection.actionTaken}\n[${timestamp}] ${logMessage}${userObservation}`
      : `[${timestamp}] ${logMessage}${userObservation}`;

    await this.inspectionRepository.update(inspectionId, {
      statusId: newStatusId,
      actionTaken: newActionTaken,
      gateOperatorId: userId,
    });

    // 7. Retorno
    const updated = await this.inspectionRepository.findById(inspectionId);
    if (!updated) throw new InternalServerErrorException('Erro ao recuperar inspeção atualizada.');
    
    return updated;
  }
}