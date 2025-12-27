export abstract class DeleteConferenceSealUseCase {
  /**
   * Remove um lacre de CONFERÊNCIA (Final).
   * Regras:
   * 1. Status deve ser 5 (EM_CONFERENCIA).
   * 2. O lacre deve ser do estágio FINAL (2).
   */
  abstract execute(inspectionId: number, sealId: number): Promise<void>;
}