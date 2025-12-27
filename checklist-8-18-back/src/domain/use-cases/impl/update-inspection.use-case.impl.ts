import { Inject, Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { UpdateInspectionUseCase } from '../update-inspection.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { UpdateInspectionDto } from 'src/api/dtos/update-inspection.dto';
import { Inspection } from '../../models/inspection.model';

@Injectable()
export class UpdateInspectionUseCaseImpl implements UpdateInspectionUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) { }

  // MUDANÇA AQUI: Adicionado '3' (REPROVADO) para permitir correção de cadastro
  private readonly ALLOWED_EDIT_STATUSES = [1, 4, 3]; 
  // 1=EM_INSPECAO, 4=AGUARDANDO, 3=REPROVADO

  async execute(id: number, dto: UpdateInspectionDto): Promise<Inspection> {
    const initialInspection = await this.inspectionRepository.findById(id);
    if (!initialInspection) {
      throw new NotFoundException(`Inspeção com o ID "${id}" não foi encontrada.`);
    }

    if (!this.ALLOWED_EDIT_STATUSES.includes(initialInspection.statusId)) {
      throw new ForbiddenException(
        `A edição de dados cadastrais não é permitida no status atual: ${initialInspection.status?.name || initialInspection.statusId}.`
      );
    }

    // 2. Desestruturamos o DTO
    const { sealVerificationDate, ...restOfDto } = dto;

    // 3. Atribuição segura
    const updatePayload: Partial<Inspection> = { ...restOfDto };

    // 4. Conversão de data
    if (sealVerificationDate) {
      updatePayload.sealVerificationDate = new Date(sealVerificationDate);
    }

    // 5. Executa a atualização
    if (Object.keys(dto).length > 0) {
      await this.inspectionRepository.update(id, updatePayload);
    }

    // 6. Retorno
    const updatedInspection = await this.inspectionRepository.findById(id);
    if (!updatedInspection) {
      throw new InternalServerErrorException(`A inspeção com ID "${id}" foi removida durante a atualização.`);
    }

    return updatedInspection;
  }
}