import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteInspectionUseCase } from '../delete-inspection.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import * as path from 'path';

@Injectable()
export class DeleteInspectionUseCaseImpl implements DeleteInspectionUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
  ) { }

  async execute(id: number): Promise<void> {
    // 1. Busca a inspeção para validar as regras de negócio.
    const inspection = await this.inspectionRepository.findById(id);

    // 2. Regra 1: A inspeção deve existir (satisfaz o teste de NotFound).
    if (!inspection) {
      throw new NotFoundException(`Inspeção com o ID "${id}" não foi encontrada.`);
    }

    // 3. Regra 2: A inspeção deve estar "EM INSPEÇÃO" (1) ou "AGUARDANDO_INSPECAO" (4).
    const allowedStatuses = [1, 4]; // 1 = EM_INSPECAO, 4 = AGUARDANDO_INSPECAO
    
    if (!allowedStatuses.includes(inspection.statusId)) {
      throw new ForbiddenException(
        'Apenas inspeções com o status "EM INSPEÇÃO" ou "AGUARDANDO INSPEÇÃO" podem ser apagadas.',
      );
    }

    // 4. Se as regras passarem, orquestra a exclusão (satisfaz o teste de sucesso).
    // Primeiro, apaga o registro do banco de dados.
    await this.inspectionRepository.delete(id);

    // Depois, apaga o diretório de uploads da inspeção principal (ex: /uploads/3)
    const inspectionDir = path.join(process.cwd(), 'uploads', String(id));
    await this.fileSystem.deleteDirectory(inspectionDir);

    // E também apaga o diretório de uploads de finalização (ex: /uploads/inspections/3)
    const inspectionFinalizeDir = path.join(process.cwd(), 'uploads', 'inspections', String(id));
    await this.fileSystem.deleteDirectory(inspectionFinalizeDir);
  }
}