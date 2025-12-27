import { Inject, Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AttachSignaturesUseCase } from '../attach-signatures.use-case';
import { InspectionRepositoryPort } from 'src/domain/repositories/inspection.repository.port';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import { AttachSignaturesDto } from 'src/api/dtos/attach-signatures.dto';
import { Inspection } from 'src/domain/models/inspection.model';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';
import { User } from '@domain/models/user.model';

type UploadedFiles = {
  inspectorSignature?: Express.Multer.File[];
  driverSignature?: Express.Multer.File[];
  checkerSignature?: Express.Multer.File[];
};
type UpdatedUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AttachSignaturesUseCaseImpl implements AttachSignaturesUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystemService: FileSystemPort,
  ) { }

  async execute(
    userId: number,
    inspectionId: number,
    dto: AttachSignaturesDto,
    files: UploadedFiles,
  ): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw new NotFoundException(`Inspeção com ID "${inspectionId}" não encontrada.`);
    }

    const updatePayload: Partial<InspectionEntity> = {};
    const signaturesDir = path.join('inspections', inspectionId.toString());

    // Função auxiliar para ler buffer se necessário
    const getFileBuffer = async (file: Express.Multer.File): Promise<Buffer> => {
      if (file.buffer) return file.buffer;
      // Esta lógica é para testes E2E onde o 'buffer' pode não estar presente
      if (file.path) {
        try {
          return await fs.readFile(file.path);
        } catch (e) {
          throw new InternalServerErrorException(`Falha ao ler o ficheiro temporário: ${file.path}`);
        }
      }
      throw new BadRequestException(`Ficheiro inválido: ${file.originalname}. Sem buffer ou caminho.`);
    };

    // Lógica para assinatura do INSPETOR
    if (dto.useProfileSignature) {
      const user = await this.userRepository.findById(userId);
      if (!user?.signaturePath) {
        throw new BadRequestException('Opção "usar assinatura do perfil" selecionada, mas o usuário não possui uma assinatura salva.');
      }
      // Ele apenas passa o diretório e o nome do ficheiro para o copyFile.
      const fileName = path.basename(user.signaturePath);
      // O UseCase constrói o caminho de destino completo (relativo ao root do projeto)
      // para que o FileSystemService saiba para onde copiar.
      const destinationPath = path.join(process.cwd(), 'uploads', signaturesDir, fileName);
      updatePayload.inspectorSignaturePath = await this.fileSystemService.copyFile(
        user.signaturePath, // Origem (ex: uploads/signatures/user_1.png)
        destinationPath,    // Destino (ex: C:/.../uploads/inspections/1/user_1.png)
      );
    } else if (files.inspectorSignature?.[0]) {
      const file = files.inspectorSignature[0];
      const fileBuffer = await getFileBuffer(file);
      const fileName = `inspector_signature${path.extname(file.originalname)}`;
      updatePayload.inspectorSignaturePath = await this.fileSystemService.saveFile(
        signaturesDir,
        fileName,
        fileBuffer,
      );
    }

    // Lógica para assinatura do MOTORISTA
    if (files.driverSignature?.[0]) {
      const file = files.driverSignature[0];
      const fileBuffer = await getFileBuffer(file);
      const fileName = `driver_signature${path.extname(file.originalname)}`;
      updatePayload.driverSignaturePath = await this.fileSystemService.saveFile(
        signaturesDir,
        fileName,
        fileBuffer,
      );
    }

    // Lógica para assinatura do CONFERENTE
    if (files.checkerSignature?.[0]) {
      const file = files.checkerSignature[0];
      const fileBuffer = await getFileBuffer(file);
      const fileName = `checker_signature${path.extname(file.originalname)}`;
      updatePayload.sealVerificationSignaturePath = await this.fileSystemService.saveFile(
        signaturesDir,
        fileName,
        fileBuffer,
      );
    }

    // Atualiza a inspeção com os caminhos das assinaturas
    if (Object.keys(updatePayload).length > 0) {
      await this.inspectionRepository.update(inspectionId, updatePayload as Partial<Inspection>);
    }

    const updatedInspection = await this.inspectionRepository.findById(inspectionId);
    if (!updatedInspection) {
      throw new NotFoundException(`A inspeção com ID "${inspectionId}" não existe após a atualização.`);
    }

    return updatedInspection;
  }
}
