import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  InternalServerErrorException, // Importar para erro genérico se sumir do nada
} from '@nestjs/common';
import { StartLoadingUseCase } from '../start-loading.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { Inspection } from '../../models/inspection.model';

const STATUS_AGUARDANDO_CONFERENCIA = 7;
const STATUS_EM_CONFERENCIA = 5;

@Injectable()
export class StartLoadingUseCaseImpl implements StartLoadingUseCase {
  private readonly logger = new Logger(StartLoadingUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(inspectionId: number, conferenteId: number): Promise<Inspection> {
    // 1. Busca a inspeção
    const inspection = await this.inspectionRepository.findById(inspectionId);

    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    // 2. Validação de Status (Guardrail)
    // Só aceita se estiver na fila de espera (7).
    if (inspection.statusId !== STATUS_AGUARDANDO_CONFERENCIA) {
       
       // Idempotência: Se já foi iniciada pelo mesmo conferente, retornamos ok.
       if (inspection.statusId === STATUS_EM_CONFERENCIA && inspection.conferenteId === conferenteId) {
           this.logger.warn(`Inspeção ${inspectionId} retomada pelo conferente ${conferenteId}.`);
           
           // --- CORREÇÃO AQUI ---
           // Temos que esperar o resultado e validar se não é null
           const existing = await this.inspectionRepository.findByIdWithDetails(inspectionId);
           
           if (!existing) {
             throw new InternalServerErrorException(`Erro crítico: Inspeção ${inspectionId} encontrada no check inicial mas não nos detalhes.`);
           }
           
           return existing;
       }

       throw new ForbiddenException(
        `Não é possível iniciar o carregamento. Status atual: ${inspection.status?.name || inspection.statusId} (Esperado: 7).`
      );
    }

    const updatePayload: Partial<Inspection> = {
      statusId: STATUS_EM_CONFERENCIA, // 5
      conferenteId: conferenteId,      // Vincula o usuário
      conferenceStartedAt: new Date(), // Timestamp de início
    };

    await this.inspectionRepository.update(inspectionId, updatePayload);
    
    this.logger.log(`Conferência iniciada para Inspeção ${inspectionId} pelo usuário ${conferenteId}.`);

    // 4. Retorno com Dados para Conferência Visual
    // O método findByIdWithDetails deve carregar a relação 'seals'
    const updated = await this.inspectionRepository.findByIdWithDetails(inspectionId);
    
    if (!updated) {
        throw new NotFoundException('Erro ao recuperar inspeção atualizada.');
    }

    // O Frontend receberá o objeto 'seals' dentro da inspeção e poderá filtrar 
    // onde seal.stage.name === 'INITIAL' para mostrar ao conferente.
    return updated;
  }
}