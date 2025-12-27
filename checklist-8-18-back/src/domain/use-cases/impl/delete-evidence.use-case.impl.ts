import { 
  Inject, 
  Injectable, 
  NotFoundException, 
  InternalServerErrorException,
  ForbiddenException // <-- 1. Importar ForbiddenException
} from '@nestjs/common';
import { DeleteEvidenceUseCase } from '../delete-evidence.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import * as path from 'path';

@Injectable()
export class DeleteEvidenceUseCaseImpl implements DeleteEvidenceUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
  ) {}

  async execute(
    inspectionId: number,
    pointNumber: number,
    fileName: string,
  ): Promise<void> {
    
    // 1. Buscamos a inspeção primeiro para checar o status
    const inspection = await this.inspectionRepository.findById(inspectionId);
    
    if (!inspection) {
      throw new NotFoundException(`Inspeção com ID "${inspectionId}" não encontrada.`);
    }

    // 2. Regra: Só pode apagar se estiver EM_INSPECAO (1) ou AGUARDANDO_INSPECAO (4)
    const ALLOWED_STATUSES = [1, 4];
    
    if (!ALLOWED_STATUSES.includes(inspection.statusId)) {
      throw new ForbiddenException(
        `Não é permitido remover evidências de uma inspeção finalizada (Status: ${inspection.status?.name || inspection.statusId}).`
      );
    }


    // 3. Encontra a evidência pelo seu contexto e nome
    const evidence = await this.inspectionRepository.findEvidenceByFileName(
      inspectionId,
      pointNumber,
      fileName,
    );
    
    if (!evidence) {
      throw new NotFoundException(`Evidência com nome "${fileName}" não encontrada para este ponto.`);
    }
    
    // 4. Constrói o caminho absoluto e apaga o ficheiro FÍSICO primeiro.
    // Usamos 'uploads' no path.join para garantir o caminho correto a partir da raiz
    const absolutePath = path.join(process.cwd(), 'uploads', evidence.filePath);

    try {
      // Verifica se existe antes de tentar apagar para evitar erro se já foi apagado manualmente
      if (await this.fileSystem.fileExists(absolutePath)) {
          await this.fileSystem.deleteFile(absolutePath);
      }
    } catch (error) {
        // Se a remoção do ficheiro falhar (ex: permissão), lançamos erro e o banco não é alterado.
        throw new InternalServerErrorException(`Falha ao apagar o ficheiro físico: ${error.message}`);
    }

    // 5. Somente se a remoção do ficheiro foi bem-sucedida (ou ele não existia), apaga o registo.
    await this.inspectionRepository.deleteEvidence(evidence.id);
  }
}