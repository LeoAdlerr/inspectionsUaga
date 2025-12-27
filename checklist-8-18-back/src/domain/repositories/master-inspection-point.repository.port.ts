import { MasterInspectionPoint } from '../models/master-inspection-point.model';

export abstract class MasterInspectionPointRepositoryPort {
  /**
   * Busca todos os pontos de inspeção mestre.
   * @returns Uma promessa que resolve para um array de MasterInspectionPoint.
   */
  abstract findAll(): Promise<MasterInspectionPoint[]>;

  /**
   * Encontra os MasterPoints corretos com base na modalidade da inspeção.
   * @param modalityId O ID da modalidade (1 para Rodoviário, 2 para Marítimo, 3 para Aéreo).
   * @returns Uma promessa que resolve para um array de MasterInspectionPoints.
   */
  abstract findForModality(modalityId: number): Promise<MasterInspectionPoint[]>;
}