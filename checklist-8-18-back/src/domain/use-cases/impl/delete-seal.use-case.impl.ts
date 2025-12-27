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
import { DeleteSealUseCase } from '../delete-seal.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { InspectionSealEntity } from 'src/infra/typeorm/entities/inspection-seal.entity';

const STATUS_AGUARDANDO_CONFERENCIA = 7;

@Injectable()
export class DeleteSealUseCaseImpl implements DeleteSealUseCase {
  private readonly logger = new Logger(DeleteSealUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
    private readonly dataSource: DataSource,
  ) {}

  async execute(inspectionId: number, sealId: number): Promise<void> {
    // 1. Validar Inspeção e Status
    const inspection = await this.inspectionRepository.findById(inspectionId);
    
    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    if (inspection.statusId !== STATUS_AGUARDANDO_CONFERENCIA) {
      throw new ForbiddenException(
        `Não é permitido apagar lacres neste status (${inspection.status?.name || inspection.statusId}). Apenas em 'AGUARDANDO_CONFERENCIA'.`
      );
    }

    // 2. Buscar o Lacre
    const sealRepo = this.dataSource.getRepository(InspectionSealEntity);
    const seal = await sealRepo.findOne({ where: { id: sealId, inspectionId } });

    if (!seal) {
      throw new NotFoundException(`Lacre ${sealId} não encontrado ou não pertence à inspeção ${inspectionId}.`);
    }

    // 3. Tentar Apagar o Arquivo Físico (Prioridade Crítica)
    if (seal.photoPath) {
      // CORREÇÃO AQUI: Removemos 'uploads' pois seal.photoPath já o contém.
      const absolutePath = path.join(process.cwd(), seal.photoPath);
      
      const fileExists = await this.fileSystem.fileExists(absolutePath);

      if (fileExists) {
        try {
          await this.fileSystem.deleteFile(absolutePath);
          this.logger.log(`Arquivo físico apagado com sucesso: ${absolutePath}`);
        } catch (error) {
          this.logger.error(`Falha crítica ao apagar arquivo físico do lacre ${sealId}: ${error.message}`);
          throw new InternalServerErrorException(
            `Não foi possível apagar o arquivo de imagem. A operação foi cancelada para manter a consistência.`
          );
        }
      } else {
        this.logger.warn(`Arquivo físico não encontrado em ${absolutePath}. Prosseguindo com a limpeza do registro.`);
      }
    }

    // 4. Apagar o Registro do Banco
    await sealRepo.delete(sealId);
    this.logger.log(`Registro do lacre ${sealId} removido do banco de dados.`);
  }
}