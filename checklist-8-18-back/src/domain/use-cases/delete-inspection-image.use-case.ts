export abstract class DeleteInspectionImageUseCase {
  /**
   * Remove uma imagem (placa, panorâmica, etc.) da inspeção.
   * * Regras:
   * 1. A inspeção deve estar no status 7 (AGUARDANDO_CONFERENCIA).
   * 2. A imagem deve pertencer à inspeção informada.
   * 3. Apaga o arquivo físico e o registro no banco.
   *
   * @param inspectionId ID da inspeção.
   * @param imageId ID da imagem a ser removida.
   */
  abstract execute(inspectionId: number, imageId: number): Promise<void>;
}