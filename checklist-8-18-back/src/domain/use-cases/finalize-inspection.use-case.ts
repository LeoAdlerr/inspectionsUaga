import { Inspection } from '../models/inspection.model';
import { FinalizeInspectionDto } from 'src/api/dtos/finalize-inspection.dto';

// O Interceptor do NestJS para múltiplos campos de ficheiro nos dará um objeto
// onde cada chave é o nome do campo e o valor é um array de ficheiros.
export type FinalizeUploadedFiles = {
  sealPhoto: Express.Multer.File[];
  platePhoto: Express.Multer.File[];
};

export abstract class FinalizeInspectionUseCase {
  /**
   * Executa a lógica de finalização da inspeção,
   * incluindo a verificação de pré-requisitos (como assinatura do motorista),
   * o salvamento das fotos de lacre/placa e a definição do status final.
   *
   * @param inspectionId O ID da inspeção a ser finalizada.
   * @param dto O objeto DTO contendo os dados de finalização (ex: número do lacre).
   * @param files Os ficheiros de imagem (foto do lacre, foto da placa) enviados.
   * @returns Uma promessa que resolve para a inspeção finalizada.
   */
  abstract execute(
    inspectionId: number,
    dto: FinalizeInspectionDto,
    files: FinalizeUploadedFiles,
  ): Promise<Inspection>;
}