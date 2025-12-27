export abstract class DeleteSealUseCase {
  /**
   * Remove um lacre da inspeção.
   * * Regras:
   * 1. A inspeção deve estar no status 7 (AGUARDANDO_CONFERENCIA).
   * 2. O lacre deve pertencer à inspeção informada.
   * 3. Apaga o arquivo físico e o registro no banco.
   *
   * @param inspectionId ID da inspeção (contexto de segurança).
   * @param sealId ID do lacre a ser removido.
   */
  abstract execute(inspectionId: number, sealId: number): Promise<void>;
}