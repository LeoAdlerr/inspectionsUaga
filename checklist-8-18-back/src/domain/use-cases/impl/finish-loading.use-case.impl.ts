import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { DataSource } from 'typeorm';
import { FinishLoadingUseCase, FinishLoadingUploadedFiles } from '../finish-loading.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { Inspection } from '../../models/inspection.model';
import { FinishLoadingDto } from 'src/api/dtos/finish-loading.dto';

// Entidades para a Transação
import { InspectionSealEntity } from 'src/infra/typeorm/entities/inspection-seal.entity';
import { InspectionImageEntity } from 'src/infra/typeorm/entities/inspection-image.entity';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';

// Constantes de Status
const STATUS_EM_CONFERENCIA = 5;
const STATUS_CONFERENCIA_FINALIZADA = 6;

// Lookups IDs
const SEAL_STAGE_FINAL = 2; // 2 = FINAL
const IMAGE_CATEGORY_PANORAMIC = 2; // 2 = PANORAMIC

@Injectable()
export class FinishLoadingUseCaseImpl implements FinishLoadingUseCase {
  private readonly logger = new Logger(FinishLoadingUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
    private readonly dataSource: DataSource,
  ) { }

  async execute(
    inspectionId: number,
    conferenteId: number,
    dto: FinishLoadingDto,
    files: FinishLoadingUploadedFiles,
  ): Promise<Inspection> {
    this.logger.log(`Iniciando Finalização de Carregamento para Inspeção ${inspectionId}`);

    // 1. Validação Básica de Entrada
    if (dto.hasPrecinto === undefined || dto.hasPrecinto === null) {
      throw new BadRequestException('A indicação de precinto (hasPrecinto) é obrigatória.');
    }

    if (!files.finalSealPhotos || files.finalSealPhotos.length === 0) {
      throw new BadRequestException('Pelo menos uma foto do lacre final é obrigatória.');
    }

    if (!files.panoramicPhotos || files.panoramicPhotos.length === 0) {
      throw new BadRequestException('Pelo menos uma foto panorâmica (carga) é obrigatória.');
    }

    // Regra: Mesmo número de fotos e números de lacres
    if (files.finalSealPhotos.length !== dto.finalSealNumbers.length) {
      throw new BadRequestException(
        `Disparidade de dados: Recebidos ${dto.finalSealNumbers.length} números de lacre e ${files.finalSealPhotos.length} fotos. A quantidade deve ser exata.`
      );
    }

    // 2. Buscar Inspeção e Validar Status
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    // Guardrail: Só permite finalizar se estiver EM CONFERÊNCIA (5)
    if (inspection.statusId !== STATUS_EM_CONFERENCIA) {
      throw new ForbiddenException(
        `Ação não permitida. A inspeção deve estar EM CONFERÊNCIA (5). Status atual: ${inspection.status?.name || inspection.statusId}`,
      );
    }

    // 3. Iniciar Transação
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Rastreamento de arquivos para Rollback
    const savedFilePaths: string[] = [];

    try {
      const filesBaseDir = path.join('inspections', inspectionId.toString());
      const maxFiles = 3;

      // --- A. PROCESSAMENTO DOS LACRES FINAIS ---
      const sealsToProcess = files.finalSealPhotos.slice(0, maxFiles);

      this.logger.log(`Processando ${sealsToProcess.length} lacres finais.`);

      for (let i = 0; i < sealsToProcess.length; i++) {
        const photo = sealsToProcess[i];
        const sealNumber = dto.finalSealNumbers[i];

        // Salvar Arquivo
        const buffer = await this.getFileBuffer(photo);
        const fileName = `seal_final_${i + 1}_${Date.now()}${path.extname(photo.originalname)}`;

        const savedPath = await this.fileSystem.saveFile(filesBaseDir, fileName, buffer);
        savedFilePaths.push(savedPath);

        // Salvar no Banco (Stage: FINAL)
        const sealEntity = queryRunner.manager.create(InspectionSealEntity, {
          inspectionId: inspectionId,
          sealNumber: sealNumber,
          stageId: SEAL_STAGE_FINAL, // ID 2
          photoPath: savedPath,
        });
        await queryRunner.manager.save(sealEntity);
      }

      // --- B. PROCESSAMENTO DAS FOTOS PANORÂMICAS ---
      const panoramicsToProcess = files.panoramicPhotos.slice(0, maxFiles);

      this.logger.log(`Processando ${panoramicsToProcess.length} fotos panorâmicas.`);

      for (let i = 0; i < panoramicsToProcess.length; i++) {
        const photo = panoramicsToProcess[i];

        // Salvar Arquivo
        const buffer = await this.getFileBuffer(photo);
        const fileName = `panoramic_final_${i + 1}_${Date.now()}${path.extname(photo.originalname)}`;

        const savedPath = await this.fileSystem.saveFile(filesBaseDir, fileName, buffer);
        savedFilePaths.push(savedPath);

        // Salvar no Banco (Category: PANORAMIC)
        const imageEntity = queryRunner.manager.create(InspectionImageEntity, {
          inspectionId: inspectionId,
          categoryId: IMAGE_CATEGORY_PANORAMIC, // ID 2
          photoPath: savedPath,
          description: `Foto Panorâmica Final #${i + 1}`,
        });
        await queryRunner.manager.save(imageEntity);
      }

      // --- C. ATUALIZAÇÃO DO STATUS E FLAG DE PRECINTO ---
      await queryRunner.manager.update(InspectionEntity, inspectionId, {
        statusId: STATUS_CONFERENCIA_FINALIZADA, // 6
        conferenteId: conferenteId,
        conferenceEndedAt: new Date(),
        hasPrecinto: dto.hasPrecinto // <--- SALVANDO A FLAG
      });

      // --- COMMIT ---
      await queryRunner.commitTransaction();
      this.logger.log(`Carregamento finalizado com sucesso para inspeção ${inspectionId}. Status: 6. Precinto: ${dto.hasPrecinto}`);

      // Retorna a inspeção atualizada
      const updatedInspection = await this.inspectionRepository.findByIdWithDetails(inspectionId);

      if (!updatedInspection) {
        throw new InternalServerErrorException(`Falha crítica: Inspeção ${inspectionId} não encontrada após finalização.`);
      }

      return updatedInspection;

    } catch (error) {
      // --- ROLLBACK ---
      this.logger.error(`Erro na finalização do carregamento: ${error.message}. Iniciando Rollback.`);
      await queryRunner.rollbackTransaction();

      // Limpeza de arquivos órfãos
      if (savedFilePaths.length > 0) {
        this.logger.warn(`Rollback: Apagando ${savedFilePaths.length} arquivos salvos.`);
        for (const filePath of savedFilePaths) {
          try {
            const absolutePath = path.join(process.cwd(), 'uploads', filePath);
            await this.fileSystem.deleteFile(absolutePath);
          } catch (delErr) {
            this.logger.error(`Falha ao apagar arquivo de rollback ${filePath}: ${delErr.message}`);
          }
        }
      }

      throw new InternalServerErrorException(`Falha ao finalizar conferência: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  private async getFileBuffer(file: Express.Multer.File): Promise<Buffer> {
    if (file.buffer) return file.buffer;
    if (file.path) {
      return await fs.readFile(file.path);
    }
    throw new BadRequestException('Arquivo inválido (sem buffer ou path).');
  }
}