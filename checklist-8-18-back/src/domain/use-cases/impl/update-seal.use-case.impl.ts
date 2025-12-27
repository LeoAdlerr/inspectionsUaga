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
import { UpdateSealUseCase } from '../update-seal.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { InspectionSealEntity } from 'src/infra/typeorm/entities/inspection-seal.entity';
import { UpdateSealDto } from 'src/api/dtos/update-seal.dto';

const STATUS_AGUARDANDO_CONFERENCIA = 7;

@Injectable()
export class UpdateSealUseCaseImpl implements UpdateSealUseCase {
  private readonly logger = new Logger(UpdateSealUseCaseImpl.name);

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

    if (inspection.statusId !== STATUS_AGUARDANDO_CONFERENCIA) {
      throw new ForbiddenException(
        `Edição não permitida. Status atual: ${inspection.status?.name || inspection.statusId}.`
      );
    }

    // 2. Buscar o Lacre
    const sealRepo = this.dataSource.getRepository(InspectionSealEntity);
    const seal = await sealRepo.findOne({ where: { id: sealId, inspectionId } });

    if (!seal) {
      throw new NotFoundException(`Lacre ${sealId} não encontrado.`);
    }

    // 3. Atualizar Texto
    if (dto.sealNumber) {
      seal.sealNumber = dto.sealNumber;
    }

    // 4. Substituir Foto
    if (file) {
      const filesDir = path.join('inspections', inspectionId.toString());
      let baseName: string;

      // A. Lógica de Preservação de Nome
      if (seal.photoPath) {
        const oldFileName = path.parse(seal.photoPath).name; 
        // Exemplo: "seal_initial_1_163456789" ou "seal_initial_1"
        
        // Regex: Remove o timestamp final (_números) se ele existir, 
        // para pegar apenas a raiz do nome (ex: "seal_initial_1")
        baseName = oldFileName.replace(/_\d+$/, ''); 

        // Apagar arquivo físico antigo
        const oldAbsPath = path.join(process.cwd(), seal.photoPath);
        try {
          if (await this.fileSystem.fileExists(oldAbsPath)) {
            await this.fileSystem.deleteFile(oldAbsPath);
            this.logger.log(`Foto antiga apagada: ${oldAbsPath}`);
          }
        } catch (error) {
          this.logger.warn(`Falha ao apagar foto antiga: ${error.message}`);
        }
      } else {
        // Fallback apenas se NUNCA teve foto antes
        baseName = `seal_${sealId}`;
      }

      // B. Novo nome = NomeOriginal + NovoTimestamp + Extensão
      // Ex: seal_initial_1_1732000000.png
      const newFileName = `${baseName}_${Date.now()}${path.extname(file.originalname)}`;

      // C. Salvar
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