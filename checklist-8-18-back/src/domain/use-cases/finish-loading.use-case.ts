import { Inspection } from '../models/inspection.model';
import { FinishLoadingDto } from 'src/api/dtos/finish-loading.dto';

/**
 * Define a estrutura dos arquivos recebidos pelo Interceptor.
 * Os nomes (finalSealPhotos, panoramicPhotos) devem corresponder 
 * ao FileFieldsInterceptor no Controller.
 */
export type FinishLoadingUploadedFiles = {
  finalSealPhotos: Express.Multer.File[];
  panoramicPhotos: Express.Multer.File[];
};

export abstract class FinishLoadingUseCase {
  /**
   * Finaliza o processo de carregamento/conferência.
   * * Ações Esperadas na Implementação:
   * 1. Validar se a inspeção está no status EM_CONFERENCIA (5).
   * 2. Salvar lacres finais na tabela 'inspection_seals' com stage='FINAL' (ID 2).
   * 3. Salvar fotos panorâmicas na tabela 'inspection_images' com category='PANORAMIC' (ID 2).
   * 4. Atualizar o status para CONFERENCIA_FINALIZADA (6).
   * 5. Registrar o timestamp 'conference_ended_at'.
   *
   * @param inspectionId O ID da inspeção.
   * @param conferenteId O ID do usuário (Conferente) que está finalizando.
   * @param dto O objeto DTO contendo os números dos lacres finais.
   * @param files Os arquivos de imagem (lacres finais e panorâmicas).
   * @returns A inspeção atualizada.
   */
  abstract execute(
    inspectionId: number,
    conferenteId: number,
    dto: FinishLoadingDto,
    files: FinishLoadingUploadedFiles,
  ): Promise<Inspection>;
}