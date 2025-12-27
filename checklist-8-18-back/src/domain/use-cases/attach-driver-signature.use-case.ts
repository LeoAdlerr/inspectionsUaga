import { Inspection } from 'src/domain/models/inspection.model';
import { AttachDriverSignatureDto } from 'src/api/dtos/attach-driver-signature.dto';

export abstract class AttachDriverSignatureUseCase {
  /**
   * Processa a string base64 da assinatura do motorista, salva como um ficheiro
   * e atualiza o caminho na inspeção.
   *
   * @param inspectionId O ID da inspeção a ser atualizada.
   * @param dto O objeto contendo a string base64 da assinatura.
   * @returns Uma promessa que resolve para a inspeção atualizada.
   */
  abstract execute(inspectionId: number, dto: AttachDriverSignatureDto): Promise<Inspection>;
}