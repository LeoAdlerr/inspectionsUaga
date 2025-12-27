import { Inspection } from '../models/inspection.model';

export abstract class AssignInspectionUseCase {
  /**
   * Atribui uma inspeção (que está "Aguardando") a um inspetor,
   * mudando seu status para "Em Inspeção".
   *
   * @param inspectionId O ID da inspeção a ser assumida.
   * @param inspectorId O ID do inspetor (vindo do token JWT) que está assumindo.
   * @returns A inspeção atualizada.
   */
  abstract execute(inspectionId: number, inspectorId: number): Promise<Inspection>;
}