import { Inspection } from 'src/domain/models/inspection.model';
import { AttachSignaturesDto } from 'src/api/dtos/attach-signatures.dto';

// O Interceptor do NestJS para múltiplos campos de ficheiro nos dará um objeto
// onde cada chave é o nome do campo e o valor é um array de ficheiros.
type UploadedFiles = {
    inspectorSignature?: Express.Multer.File[];
    driverSignature?: Express.Multer.File[];
    checkerSignature?: Express.Multer.File[];
};

export abstract class AttachSignaturesUseCase {
  /**
   * Anexa as assinaturas a uma inspeção específica.
   * Orquestra o salvamento dos ficheiros e a atualização dos caminhos no banco de dados.
   * @param userId O ID do inspetor logado (para a opção 'useProfileSignature').
   * @param inspectionId O ID da inspeção a ser atualizada.
   * @param dto O DTO contendo dados adicionais, como 'useProfileSignature'.
   * @param files O objeto contendo os ficheiros de assinatura enviados.
   * @returns Uma promessa que resolve para o objeto da inspeção atualizado.
   */
  abstract execute(
    userId: number,
    inspectionId: number,
    dto: AttachSignaturesDto,
    files: UploadedFiles,
  ): Promise<Inspection>;
}