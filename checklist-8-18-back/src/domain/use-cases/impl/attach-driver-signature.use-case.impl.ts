import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as path from 'path';
import { AttachDriverSignatureUseCase } from '../attach-driver-signature.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { AttachDriverSignatureDto } from 'src/api/dtos/attach-driver-signature.dto';
import { Inspection } from '../../models/inspection.model';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';

@Injectable()
export class AttachDriverSignatureUseCaseImpl implements AttachDriverSignatureUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystemService: FileSystemPort,
  ) {}

  async execute(inspectionId: number, dto: AttachDriverSignatureDto): Promise<Inspection> {
    // 1. Garante que a inspeção existe
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw new NotFoundException(`Inspeção com ID "${inspectionId}" não encontrada.`);
    }

    // 2. Se o motorista já tiver uma assinatura, apaga o ficheiro antigo
    if (inspection.driverSignaturePath) {
      await this.fileSystemService.deleteFileIfExists(inspection.driverSignaturePath);
    }

    // 3. Processa a string base64
    const { buffer, extension } = this.convertBase64ToBuffer(dto.driverSignature);

    // 4. Define o caminho e salva o novo ficheiro
    const signaturesDir = path.join('inspections', inspectionId.toString());
    const fileName = `driver_signature.${extension}`;
    
    const newSignaturePath = await this.fileSystemService.saveFile(
      signaturesDir,
      fileName,
      buffer,
    );

    // 5. Atualiza o registro da inspeção com o novo caminho
    await this.inspectionRepository.update(inspectionId, {
      driverSignaturePath: newSignaturePath,
    });

    // 6. Retorna a inspeção atualizada (o findById já mapeia para o Model)
    const updatedInspection = await this.inspectionRepository.findById(inspectionId);
    if (!updatedInspection) {
      throw new NotFoundException(`A inspeção com ID "${inspectionId}" desapareceu após a atualização.`);
    }
    return updatedInspection;
  }

  /**
   * Converte uma string de dados base64 (ex: "data:image/png;base64,abc...") em um Buffer e extrai a extensão.
   */
  private convertBase64ToBuffer(base64String: string): { buffer: Buffer, extension: string } {
    const match = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);

    if (!match || match.length !== 3) {
      throw new BadRequestException('Formato de assinatura base64 inválido. Esperado: "data:image/png;base64,..."');
    }
    
    const extension = match[1]; // ex: "png"
    const data = match[2]; // ex: "abc..."
    const buffer = Buffer.from(data, 'base64');
    
    return { buffer, extension };
  }
}