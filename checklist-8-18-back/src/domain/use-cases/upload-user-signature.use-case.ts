import { User } from 'src/domain/models/user.model';

// O tipo Express.Multer.File é o padrão usado pelo NestJS para ficheiros enviados
type UploadedFile = Express.Multer.File;
type UpdatedUser = Omit<User, 'passwordHash'>;

export abstract class UploadUserSignatureUseCase {
  /**
   * Processa o upload da assinatura de um usuário, salva o ficheiro e atualiza o caminho no banco de dados.
   * @param userId O ID do usuário autenticado.
   * @param file O ficheiro de imagem da assinatura enviado.
   * @returns Uma promessa que resolve para o objeto do usuário atualizado (sem o hash da senha).
   */
  abstract execute(userId: number, file: UploadedFile): Promise<UpdatedUser>;
}