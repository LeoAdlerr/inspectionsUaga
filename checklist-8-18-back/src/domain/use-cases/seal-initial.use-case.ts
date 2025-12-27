import { Inspection } from '../models/inspection.model';
import { SealInitialDto } from 'src/api/dtos/seal-initial.dto';

/**
 * Define a estrutura dos arquivos recebidos pelo Interceptor.
 * O Controller usará FileFieldsInterceptor para preencher isso.
 */
export type SealInitialUploadedFiles = {
  sealPhotos: Express.Multer.File[];
  platePhotos: Express.Multer.File[];
};

export abstract class SealInitialUseCase {
  /**
   * Executa o processo de Lacração Inicial (Pós-Inspeção/Pré-Conferência).
   * * Responsabilidades:
   * 1. Validar se a inspeção está APROVADA (Status 2) ou APROVADA_COM_RESSALVAS (Status 8).
   * 2. Abrir Transação no Banco de Dados (Atomicidade).
   * 3. Processar e salvar as fotos dos lacres (comprimidas) na tabela 'inspection_seals'.
   * 4. Processar e salvar as fotos das placas (comprimidas) na tabela 'inspection_images'.
   * 5. Atualizar o status da inspeção para AGUARDANDO_CONFERENCIA (7).
   * * @param inspectionId ID da inspeção.
   * @param dto DTO contendo os números dos lacres (texto).
   * @param files Arquivos de imagem (lacres e placas).
   */
  abstract execute(
    inspectionId: number,
    dto: SealInitialDto,
    files: SealInitialUploadedFiles,
  ): Promise<Inspection>;
}