export abstract class SoftDeleteUserUseCase {
  /**
   * Desativa (soft delete) um usuário, alterando o seu status 'isActive' para false.
   * @param id O ID do usuário a ser desativado.
   * @returns Uma promessa que resolve quando a operação é concluída.
   */
  abstract execute(id: number): Promise<void>;
}