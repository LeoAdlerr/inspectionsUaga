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
import { DeleteConferenceImageUseCase } from '../delete-conference-image.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { InspectionImageEntity } from 'src/infra/typeorm/entities/inspection-image.entity';

const STATUS_EM_CONFERENCIA = 5;
const IMAGE_CATEGORY_PANORAMIC = 2;

@Injectable()
export class DeleteConferenceImageUseCaseImpl implements DeleteConferenceImageUseCase {
  private readonly logger = new Logger(DeleteConferenceImageUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
    private readonly dataSource: DataSource,
  ) {}

  async execute(inspectionId: number, imageId: number): Promise<void> {
    // 1. Validar Status
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);

    if (inspection.statusId !== STATUS_EM_CONFERENCIA) {
      throw new ForbiddenException(`Ação permitida apenas quando EM CONFERÊNCIA.`);
    }

    // 2. Validar Imagem e Categoria
    const imageRepo = this.dataSource.getRepository(InspectionImageEntity);
    const image = await imageRepo.findOne({ where: { id: imageId, inspectionId } });

    if (!image) throw new NotFoundException(`Imagem ${imageId} não encontrada.`);

    // GUARDRAIL: Conferente só apaga Panorâmicas
    if (image.categoryId !== IMAGE_CATEGORY_PANORAMIC) {
      throw new ForbiddenException('O conferente só pode remover fotos panorâmicas.');
    }

    // 3. Apagar Arquivo
    if (image.photoPath) {
      const absolutePath = path.join(process.cwd(), 'uploads', image.photoPath);
      try {
        if (await this.fileSystem.fileExists(absolutePath)) {
          await this.fileSystem.deleteFile(absolutePath);
        }
      } catch (error) {
        throw new InternalServerErrorException('Falha ao apagar o arquivo físico.');
      }
    }

    // 4. Apagar Registro
    await imageRepo.delete(imageId);
  }
}