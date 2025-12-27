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
import { SealInitialUseCase, SealInitialUploadedFiles } from '../seal-initial.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { Inspection } from '../../models/inspection.model';
import { SealInitialDto } from 'src/api/dtos/seal-initial.dto';

// Entidades para a Transação
import { InspectionSealEntity } from 'src/infra/typeorm/entities/inspection-seal.entity';
import { InspectionImageEntity } from 'src/infra/typeorm/entities/inspection-image.entity';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';

// Constantes de Negócio
const STATUS_APROVADO = 2;
const STATUS_REPROVADO = 3; 
const STATUS_APROVADO_COM_RESSALVAS = 8;
const STATUS_AGUARDANDO_CONFERENCIA = 7;

// Lookups IDs
const SEAL_STAGE_INITIAL = 1; // 1 = INITIAL
const IMAGE_CATEGORY_PLATE = 1; // 1 = PLATE
const MAX_ITEMS_LIMIT = 3; // Limite máximo de fotos/lacres

@Injectable()
export class SealInitialUseCaseImpl implements SealInitialUseCase {
  private readonly logger = new Logger(SealInitialUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    inspectionId: number,
    dto: SealInitialDto,
    files: SealInitialUploadedFiles,
  ): Promise<Inspection> {
    this.logger.log(`Iniciando Lacração Inicial para Inspeção ${inspectionId}`);

    // 1. Validar integridade básica do Payload vs Arquivos
    if (files.sealPhotos && files.sealPhotos.length !== dto.sealNumbers.length) {
      throw new BadRequestException(
        `Disparidade de dados: Recebidos ${dto.sealNumbers.length} números de lacre e ${files.sealPhotos.length} fotos. Eles devem corresponder.`,
      );
    }

    // 2. Buscar Inspeção COM DETALHES (Necessário para contar o que já existe)
    const inspection = await this.inspectionRepository.findByIdWithDetails(inspectionId);
    
    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    // 3. Validar Status Permitido
    const allowedStatuses = [STATUS_APROVADO, STATUS_APROVADO_COM_RESSALVAS, STATUS_REPROVADO];
    if (!allowedStatuses.includes(inspection.statusId)) {
      throw new ForbiddenException(
        `Ação não permitida. A inspeção deve estar APROVADA (2), REPROVADA (3) ou COM RESSALVAS (8). Status atual: ${inspection.statusId}`,
      );
    }

    // --- 4. LÓGICA INTELIGENTE DE QUANTIDADE (SLOTS) ---

    // A. Contar Lacres Iniciais Existentes
    const existingSealsCount = inspection.seals 
      ? inspection.seals.filter(s => s.stage?.id === SEAL_STAGE_INITIAL).length 
      : 0;

    // B. Contar Fotos de Placa Existentes
    const existingPlatesCount = inspection.images
      ? inspection.images.filter(img => img.category?.id === IMAGE_CATEGORY_PLATE).length
      : 0;

    const incomingSealCount = files.sealPhotos ? files.sealPhotos.length : 0;
    const incomingPlateCount = files.platePhotos ? files.platePhotos.length : 0;

    // C. Validar Limite de Lacres
    const remainingSealSlots = MAX_ITEMS_LIMIT - existingSealsCount;
    
    if (remainingSealSlots <= 0 && incomingSealCount > 0) {
        throw new BadRequestException(`Limite de ${MAX_ITEMS_LIMIT} lacres iniciais já foi atingido. Não é possível adicionar mais.`);
    }
    
    if (incomingSealCount > remainingSealSlots) {
        throw new BadRequestException(
            `Você está tentando enviar ${incomingSealCount} lacres, mas só restam ${remainingSealSlots} espaços disponíveis (Total máx: 3).`
        );
    }

    // D. Validar Limite de Placas
    const remainingPlateSlots = MAX_ITEMS_LIMIT - existingPlatesCount;

    if (remainingPlateSlots <= 0 && incomingPlateCount > 0) {
        throw new BadRequestException(`Limite de ${MAX_ITEMS_LIMIT} fotos de placa já foi atingido. Não é possível adicionar mais.`);
    }

    if (incomingPlateCount > remainingPlateSlots) {
        throw new BadRequestException(
            `Você está tentando enviar ${incomingPlateCount} fotos de placa, mas só restam ${remainingPlateSlots} espaços disponíveis (Total máx: 3).`
        );
    }

    // E. Validação de Mínimos (Apenas se ainda não tiver nenhum)
    // Se o user já tem 3 fotos no banco, ele pode mandar 0 agora. 
    // Mas se ele tem 0 no banco, ele precisa mandar pelo menos 1.
    if (existingSealsCount === 0 && incomingSealCount === 0) {
        throw new BadRequestException('Pelo menos uma foto de lacre é obrigatória (nenhuma existente).');
    }
    if (existingPlatesCount === 0 && incomingPlateCount === 0) {
        throw new BadRequestException('Pelo menos uma foto de placa é obrigatória (nenhuma existente).');
    }

    // --- 5. INICIAR TRANSAÇÃO ---
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const savedFilePaths: string[] = [];

    try {
      const filesBaseDir = path.join('inspections', inspectionId.toString());

      // --- PROCESSAMENTO DOS LACRES ---
      if (incomingSealCount > 0) {
          this.logger.log(`Adicionando ${incomingSealCount} novos lacres.`);
          
          for (let i = 0; i < incomingSealCount; i++) {
            const photo = files.sealPhotos[i];
            const sealNumber = dto.sealNumbers[i];
            
            // Calculamos o índice correto: Existentes + Atual + 1
            // Ex: Já tem 2. Estou salvando o 1º novo. Index = 2 + 0 + 1 = 3.
            const sealIndex = existingSealsCount + i + 1;

            const buffer = await this.getFileBuffer(photo);
            const fileName = `seal_initial_${sealIndex}_${Date.now()}${path.extname(photo.originalname)}`;
            
            const savedPath = await this.fileSystem.saveFile(filesBaseDir, fileName, buffer);
            savedFilePaths.push(savedPath);

            const sealEntity = queryRunner.manager.create(InspectionSealEntity, {
              inspectionId: inspectionId,
              sealNumber: sealNumber,
              stageId: SEAL_STAGE_INITIAL,
              photoPath: savedPath,
            });
            await queryRunner.manager.save(sealEntity);
          }
      }

      // --- PROCESSAMENTO DAS PLACAS ---
      if (incomingPlateCount > 0) {
          this.logger.log(`Adicionando ${incomingPlateCount} novas fotos de placa.`);

          for (let i = 0; i < incomingPlateCount; i++) {
            const photo = files.platePhotos[i];
            
            // Calculamos o índice correto
            const plateIndex = existingPlatesCount + i + 1;

            const buffer = await this.getFileBuffer(photo);
            const fileName = `plate_initial_${plateIndex}_${Date.now()}${path.extname(photo.originalname)}`;
            
            const savedPath = await this.fileSystem.saveFile(filesBaseDir, fileName, buffer);
            savedFilePaths.push(savedPath);

            const imageEntity = queryRunner.manager.create(InspectionImageEntity, {
              inspectionId: inspectionId,
              categoryId: IMAGE_CATEGORY_PLATE,
              photoPath: savedPath,
              description: `Foto da Placa/Container #${plateIndex} (Lacração Inicial)`,
            });
            await queryRunner.manager.save(imageEntity);
          }
      }

      // --- ATUALIZAÇÃO DO STATUS (CONDICIONAL) ---
      if (inspection.statusId === STATUS_REPROVADO) {
        this.logger.log(`Inspeção ${inspectionId} está REPROVADA. Mantendo status 3, apenas salvando novas evidências.`);
      } else {
        // Se não for reprovado, avança para conferência
        await queryRunner.manager.update(InspectionEntity, inspectionId, {
          statusId: STATUS_AGUARDANDO_CONFERENCIA, 
        });
        this.logger.log(`Inspeção ${inspectionId} avançada para AGUARDANDO_CONFERENCIA (7).`);
      }

      await queryRunner.commitTransaction();

      // Retorno atualizado
      const updatedInspection = await this.inspectionRepository.findByIdWithDetails(inspectionId);
      if (!updatedInspection) {
        throw new InternalServerErrorException(`Falha crítica: Inspeção não encontrada após atualização.`);
      }

      return updatedInspection;

    } catch (error) {
      this.logger.error(`Erro na lacração inicial: ${error.message}. Iniciando Rollback.`);
      await queryRunner.rollbackTransaction();

      if (savedFilePaths.length > 0) {
        for (const filePath of savedFilePaths) {
          try {
             const absolutePath = path.join(process.cwd(), 'uploads', filePath);
             await this.fileSystem.deleteFile(absolutePath);
          } catch (delErr) { /* Ignorar erro de delete no rollback */ }
        }
      }
      throw error instanceof BadRequestException ? error : new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async getFileBuffer(file: Express.Multer.File): Promise<Buffer> {
    if (file.buffer) return file.buffer;
    if (file.path) return await fs.readFile(file.path);
    throw new BadRequestException('Arquivo inválido (sem buffer ou path).');
  }
}