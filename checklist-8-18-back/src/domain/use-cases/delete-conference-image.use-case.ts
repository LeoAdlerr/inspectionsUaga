export abstract class DeleteConferenceImageUseCase {
  /**
   * Remove uma imagem de CONFERÊNCIA (Panorâmica).
   * Regras:
   * 1. Status deve ser 5 (EM_CONFERENCIA).
   * 2. A imagem deve ser da categoria PANORAMIC (2).
   */
  abstract execute(inspectionId: number, imageId: number): Promise<void>;
}