export abstract class FileSystemPort {
  abstract createDirectoryIfNotExists(path: string): Promise<void>;
  abstract fileExists(path: string): Promise<boolean>;
  abstract moveFile(oldPath: string, newPath: string): Promise<void>;
  abstract ensureTempUploadDir(): Promise<void>;
  abstract deleteFile(filePath: string): Promise<void>;
  abstract deleteDirectory(dirPath: string): Promise<void>;
  abstract readFile(filePath: string): Promise<Buffer>;

  /**
   * Salva um buffer de dados num ficheiro, dentro de um diretório específico.
   * @param directory A subpasta dentro de 'uploads' (ex: 'signatures').
   * @param fileName O nome do ficheiro a ser salvo.
   * @param buffer Os dados do ficheiro.
   * @returns O caminho relativo do ficheiro salvo (ex: 'uploads/signatures/file.png').
   */
  abstract saveFile(
    directory: string,
    fileName: string,
    bufferOrFile?: Buffer | Express.Multer.File,
    mimeTypeArg?: string,
  ): Promise<string>;

  /**
   * Apaga um ficheiro se ele existir no caminho especificado.
   * Não lança um erro se o ficheiro não for encontrado.
   * @param filePath O caminho para o ficheiro a ser apagado.
   */
  abstract deleteFileIfExists(filePath: string): Promise<void>;

  /**
   * Copia um ficheiro de um local de origem para um destino.
   * @param sourcePath O caminho do ficheiro original.
   * @param destinationPath O caminho completo para onde o ficheiro será copiado.
   * @returns O caminho relativo do novo ficheiro copiado.
   */
  abstract copyFile(sourcePath: string, destinationPath: string): Promise<string>;
}