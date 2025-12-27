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
import { UpdateInspectionImageUseCase } from '../update-inspection-image.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { InspectionImageEntity } from 'src/infra/typeorm/entities/inspection-image.entity';
import { UpdateInspectionImageDto } from 'src/api/dtos/update-inspection-image.dto';

const STATUS_AGUARDANDO_CONFERENCIA = 7;

@Injectable()
export class UpdateInspectionImageUseCaseImpl implements UpdateInspectionImageUseCase {
  private readonly logger = new Logger(UpdateInspectionImageUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    inspectionId: number,
    imageId: number,
    dto: UpdateInspectionImageDto,
    file?: Express.Multer.File,
  ): Promise<InspectionImageEntity> {
    
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

    // 2. Buscar Imagem
    const imageRepo = this.dataSource.getRepository(InspectionImageEntity);
    const image = await imageRepo.findOne({ where: { id: imageId, inspectionId } });

    if (!image) {
      throw new NotFoundException(`Imagem ${imageId} não encontrada.`);
    }

    // 3. Atualizar Texto
    if (dto.description !== undefined) {
      image.description = dto.description;
    }

    // 4. Substituir Foto
    if (file) {
      const filesDir = path.join('inspections', inspectionId.toString());
      let baseName: string;

      // A. Lógica de Preservação de Nome
      if (image.photoPath) {
        const oldFileName = path.parse(image.photoPath).name; 
        
        // Remove timestamp anterior (ex: _123456)
        baseName = oldFileName.replace(/_\d+$/, '');

        // Apagar antiga
        const oldAbsPath = path.join(process.cwd(), image.photoPath);
        try {
          if (await this.fileSystem.fileExists(oldAbsPath)) {
            await this.fileSystem.deleteFile(oldAbsPath);
            this.logger.log(`Foto antiga apagada: ${oldAbsPath}`);
          }
        } catch (error) {
          this.logger.warn(`Falha ao apagar foto antiga: ${error.message}`);
        }
      } else {
        baseName = `image_${imageId}`;
      }

      // B. Novo nome = NomeOriginal + NovoTimestamp
      const newFileName = `${baseName}_${Date.now()}${path.extname(file.originalname)}`;

      // C. Salvar
      const fileBuffer = await this.getFileBuffer(file);
      const newPath = await this.fileSystem.saveFile(filesDir, newFileName, fileBuffer);
      image.photoPath = newPath;
    }

    // 5. Persistir
    return await imageRepo.save(image);
  }

  private async getFileBuffer(file: Express.Multer.File): Promise<Buffer> {
    if (file.buffer) return file.buffer;
    if (file.path) {
      return await fs.readFile(file.path);
    }
    throw new BadRequestException('Arquivo inválido (sem buffer ou path).');
  }
}