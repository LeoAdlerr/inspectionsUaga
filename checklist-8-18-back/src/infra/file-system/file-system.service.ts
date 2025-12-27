import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class FileSystemService implements FileSystemPort {
  private readonly logger = new Logger(FileSystemService.name);
  private readonly uploadsRoot = path.join(process.cwd(), 'uploads');

  async createDirectoryIfNotExists(dirPath: string): Promise<void> {
    try {
      const resolvedPath = path.resolve(dirPath);
      // this.logger.log(`Garantindo que o diretório exista: ${resolvedPath}`);
      await fs.mkdir(resolvedPath, { recursive: true });
    } catch (error) {
      if ((error as any).code !== 'EEXIST') {
        this.logger.error(`Falha ao criar diretório ${dirPath}`, error.stack);
        throw new InternalServerErrorException(`Falha ao criar diretório: ${error.message}`);
      }
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async moveFile(oldPath: string, newPath: string): Promise<void> {
    this.logger.log(`Tentando mover de '${oldPath}' para '${newPath}'`);

    if (!oldPath || !newPath) {
      throw new InternalServerErrorException('Caminho de origem ou destino inválido para moveFile.');
    }

    try {
      const destinationDir = path.dirname(newPath);
      await this.createDirectoryIfNotExists(destinationDir);
      await fs.rename(oldPath, newPath);

      const newFileExists = await this.fileExists(newPath);
      const oldFileExists = await this.fileExists(oldPath);

      if (newFileExists && !oldFileExists) {
        this.logger.log(`SUCESSO: Arquivo movido e verificado em '${newPath}'`);
      } else {
        this.logger.error(`FALHA PÓS-MOVIMENTAÇÃO: Status -> Novo arquivo existe: ${newFileExists}, Arquivo antigo existe: ${oldFileExists}`);
        throw new InternalServerErrorException('Ocorreu uma falha inesperada ao mover o ficheiro.');
      }
    } catch (error) {
      this.logger.error(`Erro ao mover ficheiro de ${oldPath} para ${newPath}`, error.stack);
      throw new InternalServerErrorException(`Erro no sistema de ficheiros: ${error.message}`);
    }
  }

  async ensureTempUploadDir(): Promise<void> {
    const tempDir = path.join(process.cwd(), 'uploads', 'tmp');
    await this.createDirectoryIfNotExists(tempDir);
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const resolvedPath = path.resolve(filePath);
      if (await this.fileExists(resolvedPath)) {
        this.logger.log(`Apagando ficheiro: ${resolvedPath}`);
        await fs.unlink(resolvedPath);
      } else {
        this.logger.warn(`Tentativa de apagar ficheiro inexistente: ${resolvedPath}`);
      }
    } catch (error) {
      this.logger.error(`Falha ao apagar ficheiro ${filePath}`, error.stack);
      throw new InternalServerErrorException(`Falha ao apagar ficheiro: ${error.message}`);
    }
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    try {
      const resolvedPath = path.resolve(dirPath);
      if (fsSync.existsSync(resolvedPath)) {
        this.logger.log(`Apagando diretório e todo o seu conteúdo: ${resolvedPath}`);
        await fs.rm(resolvedPath, { recursive: true, force: true });
      } else {
        this.logger.warn(`Tentativa de apagar diretório inexistente: ${resolvedPath}`);
      }
    } catch (error) {
      this.logger.error(`Falha ao apagar diretório ${dirPath}`, error.stack);
      throw new InternalServerErrorException(`Falha ao apagar diretório: ${error.message}`);
    }
  }

  async readFile(filePath: string): Promise<Buffer> {
    try {
      const resolvedPath = path.resolve(filePath);
      // this.logger.log(`Lendo arquivo de: ${resolvedPath}`);
      return await fs.readFile(resolvedPath);
    } catch (error) {
      this.logger.error(`Falha ao ler o arquivo ${filePath}`, error.stack);
      throw new InternalServerErrorException(`Falha ao ler o arquivo: ${error.message}`);
    }
  }

  async saveFile(
    directory: string,
    fileName: string,
    bufferOrFile?: Buffer | Express.Multer.File,
    mimeTypeArg?: string // <-- NOVO ARGUMENTO OPCIONAL (Para salvar PDFs sem comprimir)
  ): Promise<string> {
    try {
      const dirPath = path.join(this.uploadsRoot, directory);
      await this.createDirectoryIfNotExists(dirPath);

      const fullPath = path.join(dirPath, fileName);
      let data: Buffer;
      let mimeType = mimeTypeArg; // Tenta usar o argumento passado

      // Se o argumento for um Buffer diretamente
      if (Buffer.isBuffer(bufferOrFile)) {
        data = bufferOrFile;
        // Se mimeTypeArg não foi passado, o compressor tentará inferir ou pular
      }
      // Se for um objeto Multer.File
      else if (bufferOrFile && typeof bufferOrFile === 'object') {
        const file = bufferOrFile as Express.Multer.File;

        // Se não veio argumento explícito, usa o do arquivo
        if (!mimeType) mimeType = file.mimetype;

        if (file.buffer) {
          // memoryStorage
          data = file.buffer;
        } else if (file.path && fsSync.existsSync(file.path)) {
          // diskStorage
          data = await fs.readFile(file.path);
        } else {
          throw new Error('Arquivo inválido — sem buffer nem caminho físico.');
        }
      } else {
        throw new Error('Buffer ou arquivo não fornecido ao salvar ficheiro.');
      }

      // 4. Comprimir a imagem ANTES de salvar (Agora com proteção contra PDF)
      data = await this.compressImage(data, mimeType, fileName);

      await fs.writeFile(fullPath, data);

      const relativePath = path.join('uploads', directory, fileName).replace(/\\/g, '/');
      this.logger.log(`Ficheiro salvo com sucesso em: ${relativePath}`);

      return relativePath;
    } catch (error) {
      this.logger.error(`Falha ao salvar o ficheiro ${fileName}`, error.stack);
      throw new InternalServerErrorException(`Falha ao salvar o ficheiro: ${error.message}`);
    }
  }


  async deleteFileIfExists(filePath: string): Promise<void> {
    return this.deleteFile(filePath);
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<string> {
    try {
      const resolvedSource = path.resolve(sourcePath);
      const resolvedDestination = path.resolve(destinationPath);

      const destinationDir = path.dirname(resolvedDestination);
      await this.createDirectoryIfNotExists(destinationDir);

      await fs.copyFile(resolvedSource, resolvedDestination);

      const relativePath = path.relative(process.cwd(), resolvedDestination).replace(/\\/g, '/');
      this.logger.log(`Ficheiro copiado de ${sourcePath} para ${relativePath}`);

      return relativePath;
    } catch (error) {
      this.logger.error(`Falha ao copiar o ficheiro de ${sourcePath} para ${destinationPath}`, error.stack);
      throw new InternalServerErrorException(`Falha ao copiar o ficheiro: ${error.message}`);
    }
  }

  // 5. MÉTODO HELPER DE COMPRESSÃO (AGRESSIVO)
  /**
   * Comprime um buffer de imagem usando o Sharp.
   * Redimensiona para 800px de largura máxima e aplica compressão forte.
   * Pula GIFs e PDFs.
   */
  private async compressImage(buffer: Buffer, mimeType?: string, fileName?: string): Promise<Buffer> {

    // Se for PDF, retorna o buffer original imediatamente (Não tenta ler com Sharp)
    if (mimeType === 'application/pdf') {
      // this.logger.log(`Arquivo PDF detectado (${fileName}), salvando sem compressão.`);
      return buffer;
    }

    // Se for um GIF, não fazer nada para não perder animação
    if (mimeType === 'image/gif') {
      this.logger.log(`Pulando compressão para arquivo GIF: ${fileName || 'sem-nome'}`);
      return buffer;
    }

    // Se for outro tipo de imagem (ou se o tipo for desconhecido e parecer imagem)
    if (!mimeType || mimeType.startsWith('image/')) {
      try {
        this.logger.log(`Comprimindo imagem: ${fileName || 'sem-nome'} (Mime: ${mimeType || 'desconhecido'})`);

        const originalSizeKB = (buffer.length / 1024).toFixed(2);

        const compressedBuffer = await sharp(buffer)
          .resize({
            width: 800, // Reduzido para 800px
            height: 800,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 60, // Qualidade reduzida para 60
            progressive: true,
          })
          .png({
            quality: 60, // Qualidade reduzida para 60
            compressionLevel: 9, // Compressão máxima
          })
          .toBuffer();

        const newSizeKB = (compressedBuffer.length / 1024).toFixed(2);
        this.logger.log(`Compressão de ${fileName || 'sem-nome'}: ${originalSizeKB} KB -> ${newSizeKB} KB`);
        return compressedBuffer;

      } catch (error) {
        // Se o Sharp falhar (ex: não é uma imagem válida),
        // salvamos o arquivo original.
        this.logger.warn(`Falha ao comprimir "${fileName || 'sem-nome'}", salvando original. Erro: ${error.message}`);
        return buffer;
      }
    }

    // Se não for um 'image/*' nem PDF, retorna o buffer original
    return buffer;
  }
}