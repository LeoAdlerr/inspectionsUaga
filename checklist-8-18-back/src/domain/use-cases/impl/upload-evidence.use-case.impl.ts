import { 
  Inject, 
  Injectable, 
  NotFoundException, 
  Logger,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException // <-- 1. Importar ForbiddenException
} from '@nestjs/common';
import { UploadEvidenceUseCase } from '@domain/use-cases/upload-evidence.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { ItemEvidence } from '../../models/item-evidence.model';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ItemEvidenceEntity } from '@infra/typeorm/entities/item-evidence.entity';

// Status permitidos para edição do checklist
const STATUS_EM_INSPECAO = 1;
const STATUS_AGUARDANDO_INSPECAO = 4;
const STATUS_REROVADO = 3;

@Injectable()
export class UploadEvidenceUseCaseImpl implements UploadEvidenceUseCase {
  private readonly logger = new Logger(UploadEvidenceUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
    private readonly dataSource: DataSource,
  ) { }

  async execute(
    inspectionId: number,
    pointNumber: number,
    file: Express.Multer.File,
  ): Promise<ItemEvidence> {
    this.logger.log(`Iniciando transação de upload para inspeção ${inspectionId}, ponto ${pointNumber}`);

    // --- INÍCIO DO GUARDRAIL (HOTFIX) ---
    
    // 1. Busca a inspeção primeiro para validar o status
    // (Fora da transação para ser mais rápido e evitar lock desnecessário)
    const inspection = await this.inspectionRepository.findById(inspectionId);
    
    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    const allowedStatuses = [STATUS_EM_INSPECAO, STATUS_AGUARDANDO_INSPECAO, STATUS_REROVADO];
    
    if (!allowedStatuses.includes(inspection.statusId)) {
        // Se o upload foi rejeitado, precisamos garantir que o arquivo temporário seja limpo
        if (file.path) {
            await fs.unlink(file.path).catch(() => {});
        }
        
        throw new ForbiddenException(
            `Não é permitido enviar evidências para uma inspeção finalizada (Status: ${inspection.status?.name || inspection.statusId}).`
        );
    }
    // --- FIM DO GUARDRAIL ---

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let absoluteFinalPath: string | undefined;

    try {
      const item = await this.inspectionRepository.findItemByInspectionAndPoint(inspectionId, pointNumber);
      if (!item || !item.masterPoint) {
        throw new NotFoundException(`Ponto de inspeção ${pointNumber} para a inspeção ${inspectionId} não encontrado.`);
      }

      const pointNameSanitized = item.masterPoint.name.replace(/[^a-zA-Z0-9]/g, '_');
      const directoryForSaveFile = path.join(String(inspectionId), `${pointNumber}-${pointNameSanitized}`);
      const absoluteTargetDirectory = path.join(process.cwd(), 'uploads', directoryForSaveFile);

      await this.fileSystem.createDirectoryIfNotExists(absoluteTargetDirectory);

      const originalName = path.parse(file.originalname).name;
      const extension = path.parse(file.originalname).ext;
      let finalFileName = file.originalname;
      absoluteFinalPath = path.join(absoluteTargetDirectory, finalFileName);
      let counter = 1;

      while (await this.fileSystem.fileExists(absoluteFinalPath)) {
        finalFileName = `${originalName}(${counter})${extension}`;
        absoluteFinalPath = path.join(absoluteTargetDirectory, finalFileName);
        counter++;
      }

      this.logger.log(`Lendo buffer do arquivo: ${file.path || 'memory'}`);
      const fileBuffer = await this.getFileBuffer(file);
      const originalSize = fileBuffer.length;

      this.logger.log(`Salvando (e comprimindo) para '${directoryForSaveFile}/${finalFileName}'`);

      const finalRelativePath = await this.fileSystem.saveFile(
        directoryForSaveFile,
        finalFileName,
        fileBuffer 
      );

      if (file.path) {
          await fs.unlink(file.path).catch(e => this.logger.warn(`Falha ao limpar arquivo tmp: ${e.message}`));
      }

      const fileMovedSuccessfully = await this.fileSystem.fileExists(absoluteFinalPath);
      if (!fileMovedSuccessfully) {
        throw new Error('Falha ao verificar a existência do ficheiro após salvá-lo.');
      }
      this.logger.log(`VERIFICADO: Arquivo salvo em '${absoluteFinalPath}'`);

      const stats = await fs.stat(absoluteFinalPath);
      const newFileSize = stats.size;
      this.logger.log(`Tamanho original: ${originalSize} bytes. Tamanho comprimido: ${newFileSize} bytes.`);

      const evidenceData: Partial<ItemEvidence> = {
        itemId: item.id,
        filePath: finalRelativePath,
        fileName: finalFileName,
        fileSize: newFileSize,
        mimeType: file.mimetype,
      };

      const evidenceRepository = queryRunner.manager.getRepository(ItemEvidenceEntity);
      const result = await evidenceRepository.save(evidenceData);

      await queryRunner.commitTransaction();
      this.logger.log(`Transação commitada com sucesso. Upload finalizado.`);

      return result;

    } catch (error) {
      this.logger.error(`Erro durante a transação de upload: ${error.message}. Iniciando rollback.`);
      await queryRunner.rollbackTransaction();
      this.logger.warn('Rollback do banco de dados concluído.');

      if (absoluteFinalPath && (await this.fileSystem.fileExists(absoluteFinalPath))) {
        this.logger.warn(`Tentando remover ficheiro órfão em ${absoluteFinalPath}`);
        await fs.unlink(absoluteFinalPath).catch(e => this.logger.error(`Falha ao remover ficheiro órfão: ${e.message}`));
      }
      
      if (file.path && (await this.fileSystem.fileExists(file.path))) {
           this.logger.warn(`Limpando arquivo tmp do multer (em erro): ${file.path}`);
           await fs.unlink(file.path).catch(e => this.logger.error(`Falha ao limpar arquivo tmp: ${e.message}`));
      }

      throw error;

    } finally {
      await queryRunner.release();
    }
  }

  private async getFileBuffer(file: Express.Multer.File): Promise<Buffer> {
    if (file.buffer) {
      return file.buffer;
    }
    
    if (file.path) {
      try {
        const buffer = await fs.readFile(file.path);
        return buffer;
      } catch (e) {
        throw new InternalServerErrorException(`Falha ao ler o ficheiro temporário: ${file.path}`);
      }
    }
    
    throw new BadRequestException(`Ficheiro inválido: ${file.originalname}. Sem buffer ou caminho.`);
  }
}