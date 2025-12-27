import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { DataSource } from 'typeorm';
import { UpdateConferenceSealUseCase } from '../update-conference-seal.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { InspectionSealEntity } from 'src/infra/typeorm/entities/inspection-seal.entity';
import { UpdateSealDto } from 'src/api/dtos/update-seal.dto';

const STATUS_EM_CONFERENCIA = 5;
const SEAL_STAGE_FINAL = 2; // Lacres do Conferente

@Injectable()
export class UpdateConferenceSealUseCaseImpl implements UpdateConferenceSealUseCase {
  private readonly logger = new Logger(UpdateConferenceSealUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    inspectionId: number,
    sealId: number,
    dto: UpdateSealDto,
    file?: Express.Multer.File,
  ): Promise<InspectionSealEntity> {
    
    // 1. Validar Status
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    if (inspection.statusId !== STATUS_EM_CONFERENCIA) {
      throw new ForbiddenException(
        `Edição permitida apenas quando EM CONFERÊNCIA (Status 5). Atual: ${inspection.statusId}.`
      );
    }

    // 2. Buscar o Lacre
    const sealRepo = this.dataSource.getRepository(InspectionSealEntity);
    const seal = await sealRepo.findOne({ where: { id: sealId, inspectionId } });

    if (!seal) {
      throw new NotFoundException(`Lacre ${sealId} não encontrado.`);
    }

    // GUARDRAIL: Conferente só edita lacre FINAL
    if (seal.stageId !== SEAL_STAGE_FINAL) {
      throw new ForbiddenException('O conferente só pode editar lacres de saída (FINAL).');
    }

    // 3. Atualizar Texto
    if (dto.sealNumber) {
      seal.sealNumber = dto.sealNumber;
    }

    // 4. Substituir Foto (Preservando nome base)
    if (file) {
      const filesDir = path.join('inspections', inspectionId.toString());
      let baseName: string;

      if (seal.photoPath) {
        const oldFileName = path.parse(seal.photoPath).name; 
        // Remove timestamp anterior
        baseName = oldFileName.replace(/_\d+$/, '');

        // Apagar antiga
        const oldAbsPath = path.join(process.cwd(), 'uploads', seal.photoPath);
        try {
          if (await this.fileSystem.fileExists(oldAbsPath)) {
            await this.fileSystem.deleteFile(oldAbsPath);
            this.logger.log(`Foto antiga apagada: ${oldAbsPath}`);
          }
        } catch (error) {
          this.logger.warn(`Falha ao apagar foto antiga: ${error.message}`);
        }
      } else {
        baseName = `conference_seal_${sealId}`;
      }

      // Novo nome + Timestamp
      const newFileName = `${baseName}_${Date.now()}${path.extname(file.originalname)}`;

      // Salvar e Comprimir
      const fileBuffer = await this.getFileBuffer(file);
      const newPath = await this.fileSystem.saveFile(filesDir, newFileName, fileBuffer);
      
      seal.photoPath = newPath;
    }

    // 5. Persistir
    return await sealRepo.save(seal);
  }

  private async getFileBuffer(file: Express.Multer.File): Promise<Buffer> {
    if (file.buffer) return file.buffer;
    if (file.path) {
      return await fs.readFile(file.path);
    }
    throw new BadRequestException('Arquivo inválido (sem buffer ou path).');
  }
}