import { Inspection } from '../models/inspection.model';

export abstract class StartLoadingUseCase {
  /**
   * Registra o início da conferência (Check-in do Conferente).
   * * Ações:
   * 1. Valida se a inspeção está no status AGUARDANDO_CONFERENCIA (7).
   * 2. Registra o timestamp atual em 'conference_started_at'.
   * 3. Vincula o usuário logado (conferenteId).
   * 4. Atualiza o status para EM_CONFERENCIA (5).
   * * Retorno:
   * Retorna a inspeção com os lacres (seals) carregados para que o
   * conferente possa conferir visualmente o que o inspetor lançou.
   *
   * @param inspectionId ID da inspeção.
   * @param conferenteId ID do usuário logado.
   */
  abstract execute(inspectionId: number, conferenteId: number): Promise<Inspection>;
}