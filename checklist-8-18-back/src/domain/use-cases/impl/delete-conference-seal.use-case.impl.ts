import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { DeleteConferenceSealUseCase } from '../delete-conference-seal.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { InspectionSealEntity } from 'src/infra/typeorm/entities/inspection-seal.entity';

const STATUS_EM_CONFERENCIA = 5;
const SEAL_STAGE_FINAL = 2;

@Injectable()
export class DeleteConferenceSealUseCaseImpl implements DeleteConferenceSealUseCase {
  private readonly logger = new Logger(DeleteConferenceSealUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
    private readonly dataSource: DataSource,
  ) {}

  async execute(inspectionId: number, sealId: number): Promise<void> {
    // 1. Validar Status
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);

    if (inspection.statusId !== STATUS_EM_CONFERENCIA) {
      throw new ForbiddenException(
        `Ação permitida apenas quando EM CONFERÊNCIA. Status atual: ${inspection.statusId}.`
      );
    }

    // 2. Validar Lacre e Estágio
    const sealRepo = this.dataSource.getRepository(InspectionSealEntity);
    const seal = await sealRepo.findOne({ where: { id: sealId, inspectionId } });

    if (!seal) throw new NotFoundException(`Lacre ${sealId} não encontrado.`);

    // GUARDRAIL: Conferente só apaga lacre FINAL
    if (seal.stageId !== SEAL_STAGE_FINAL) {
      throw new ForbiddenException('O conferente só pode remover lacres de saída (FINAL).');
    }

    // 3. Apagar Arquivo Físico
    if (seal.photoPath) {
      // Remove 'uploads' duplicado se necessário, ou usa direto se o path for completo relativo
      // Aqui assumimos que seal.photoPath vem como "inspections/1/..." (sem uploads prefix) ou com.
      // Ajuste conforme seu padrão de salvamento. O padrão atual do FileSystem é salvar relativo a uploads.
      const absolutePath = path.join(process.cwd(), 'uploads', seal.photoPath);
      
      try {
        if (await this.fileSystem.fileExists(absolutePath)) {
          await this.fileSystem.deleteFile(absolutePath);
          this.logger.log(`Arquivo removido: ${absolutePath}`);
        }
      } catch (error) {
        this.logger.error(`Erro ao deletar arquivo: ${error.message}`);
        throw new InternalServerErrorException('Falha ao apagar o arquivo físico.');
      }
    }

    // 4. Apagar Registro
    await sealRepo.delete(sealId);
  }
}