import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterGateExitUseCase } from '../register-gate-exit.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { Inspection } from '../../models/inspection.model';
import { GenerateInspectionReportUseCase } from '../generate-inspection-report.use-case';
import { FileSystemPort } from '../../ports/file-system.port';
import { RegisterGateExitDto } from 'src/api/dtos/register-gate-exit.dto';

// Constantes de Status
const STATUS_AGUARDANDO_SAIDA = 13;
const STATUS_FINALIZADO = 11;

@Injectable()
export class RegisterGateExitUseCaseImpl implements RegisterGateExitUseCase {
  private readonly logger = new Logger(RegisterGateExitUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(GenerateInspectionReportUseCase)
    private readonly reportUseCase: GenerateInspectionReportUseCase,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
  ) {}

  async execute(
    inspectionId: number, 
    userId: number, 
    dto: RegisterGateExitDto
  ): Promise<Inspection> {
    this.logger.log(`Registrando saída (Gate Out) para inspeção ${inspectionId} pelo usuário ${userId}`);

    // 1. Busca a inspeção
    const inspection = await this.inspectionRepository.findById(inspectionId);

    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    // 2. Validação: Só pode sair se estiver Aguardando Saída (13)
    if (inspection.statusId !== STATUS_AGUARDANDO_SAIDA) {
      throw new BadRequestException(
        `Saída não permitida. A inspeção não está com status 'AGUARDANDO SAÍDA' (13). Status atual: ${inspection.statusId}`
      );
    }

    // 3. Atualizar Status de Lacres Individuais (Se houver no DTO)
    // Isso permite rastrear qual lacre específico estava NOK, se necessário
    if (dto.sealVerifications && dto.sealVerifications.length > 0) {
      for (const verification of dto.sealVerifications) {
        // Assume-se que o repositório possui updateSeal ou similar. 
        // Se não tiver, precisaremos adicionar ao InspectionRepositoryPort.
        await this.inspectionRepository.updateSeal(verification.sealId, {
           verificationStatusId: verification.statusId
        });
      }
    }

    // 4. Atualiza Inspeção (Dados Gerais, Operador e Finalização)
    const now = new Date();

    await this.inspectionRepository.update(inspectionId, {
      statusId: STATUS_FINALIZADO,
      endDatetime: now,      // Encerra o ciclo
      gateOutAt: now,        // Timestamp da portaria
      gateOperatorId: userId, // Quem liberou (Rastreabilidade)

      // Salva os status gerais da grade (visualizados no PDF)
      sealVerificationRfbStatusId: dto.sealVerificationRfbStatusId,
      sealVerificationShipperStatusId: dto.sealVerificationShipperStatusId,
      sealVerificationTapeStatusId: dto.sealVerificationTapeStatusId,
      sealVerificationDate: now,
    });

    this.logger.log(`Inspeção ${inspectionId} finalizada (Status 11). Iniciando geração de PDF...`);

    // 5. Geração e Persistência do PDF
    // O PDF é gerado AGORA, para que o nome do Gate Operator e os status dos lacres já apareçam no documento.
    try {
        const { buffer, filename } = await this.reportUseCase.executePdf(inspectionId);
        
        const directory = inspectionId.toString(); 
        const savedPath = await this.fileSystem.saveFile(directory, filename, buffer);
        
        await this.inspectionRepository.update(inspectionId, {
            generatedPdfPath: savedPath
        });

        this.logger.log(`PDF gerado e salvo em: ${savedPath}`);
    } catch (error) {
        this.logger.error(`Erro ao gerar/salvar PDF no Gate Out: ${error.message}`, error.stack);
        // Não lançamos erro aqui para não travar a saída do caminhão caso o PDF falhe (fallback)
    }

    // 6. Retorna a inspeção atualizada
    const updatedInspection = await this.inspectionRepository.findById(inspectionId);

    if (!updatedInspection) {
        throw new InternalServerErrorException(`Erro crítico: Falha ao recuperar inspeção ${inspectionId} após finalizar saída.`);
    }

    return updatedInspection;
  }
}