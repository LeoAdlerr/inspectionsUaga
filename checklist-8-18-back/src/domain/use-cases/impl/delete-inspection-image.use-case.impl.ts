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
import { DeleteInspectionImageUseCase } from '../delete-inspection-image.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { InspectionImageEntity } from 'src/infra/typeorm/entities/inspection-image.entity';

const STATUS_AGUARDANDO_CONFERENCIA = 7;

@Injectable()
export class DeleteInspectionImageUseCaseImpl implements DeleteInspectionImageUseCase {
  private readonly logger = new Logger(DeleteInspectionImageUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
    private readonly dataSource: DataSource,
  ) {}

  async execute(inspectionId: number, imageId: number): Promise<void> {
    // 1. Validar Inspeção e Status
    const inspection = await this.inspectionRepository.findById(inspectionId);
    
    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    if (inspection.statusId !== STATUS_AGUARDANDO_CONFERENCIA) {
      throw new ForbiddenException(
        `Não é permitido apagar imagens neste status (${inspection.status?.name || inspection.statusId}). Apenas em 'AGUARDANDO_CONFERENCIA'.`
      );
    }

    // 2. Buscar a Imagem
    const imageRepo = this.dataSource.getRepository(InspectionImageEntity);
    const image = await imageRepo.findOne({ where: { id: imageId, inspectionId } });

    if (!image) {
      throw new NotFoundException(`Imagem ${imageId} não encontrada ou não pertence à inspeção ${inspectionId}.`);
    }

    // 3. Tentar Apagar o Arquivo Físico (Prioridade Crítica)
    if (image.photoPath) {
      // CORREÇÃO AQUI: Removemos 'uploads' pois image.photoPath já o contém.
      const absolutePath = path.join(process.cwd(), image.photoPath);
      
      const fileExists = await this.fileSystem.fileExists(absolutePath);

      if (fileExists) {
        try {
          await this.fileSystem.deleteFile(absolutePath);
          this.logger.log(`Arquivo físico apagado com sucesso: ${absolutePath}`);
        } catch (error) {
          this.logger.error(`Falha crítica ao apagar arquivo físico da imagem ${imageId}: ${error.message}`);
          throw new InternalServerErrorException(
            `Não foi possível apagar o arquivo de imagem. A operação foi cancelada.`
          );
        }
      } else {
        this.logger.warn(`Arquivo físico não encontrado em ${absolutePath}. Prosseguindo com a limpeza do registro.`);
      }
    }

    // 4. Apagar o Registro do Banco
    await imageRepo.delete(imageId);
    this.logger.log(`Registro da imagem ${imageId} removido do banco de dados.`);
  }
}