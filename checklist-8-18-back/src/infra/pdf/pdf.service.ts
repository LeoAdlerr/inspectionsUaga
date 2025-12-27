import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { PdfPort } from '../../domain/ports/pdf.port';

// --- NOSSOS IMPORTS PARA LOGGING ---
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService implements PdfPort, OnModuleInit, OnModuleDestroy {
  /**
    * Encerra explicitamente a instância do browser Puppeteer.
    * Essencial para o teardown de testes E2E.
    */
  async close() {
    if (this.browser) {
      this.logger.log('Fechando a instância compartilhada do Puppeteer...');

      try {
        // Fecha todas as páginas abertas, se existirem
        const pages = await this.browser.pages();
        for (const page of pages) {
          try {
            await page.close({ runBeforeUnload: false });
          } catch (err) {
            this.logger.warn(`Falha ao fechar página: ${err.message}`);
          }
        }

        // Fecha o browser
        await this.browser.close();

        // Mata o processo do Puppeteer explicitamente (garantia para Jest)
        const browserProcess = this.browser.process();
        if (browserProcess) {
          browserProcess.kill('SIGKILL');
        }

        this.browser = null;
      } catch (error) {
        this.logger.error('Erro ao fechar Puppeteer:', error);
      }
    }
  }


  private readonly logger = new Logger(PdfService.name);
  private browser: Browser | null = null; // Instância do browser será compartilhada

  /**
   * Este método é chamado pelo NestJS uma única vez, quando o módulo é iniciado.
   */
  async onModuleInit() {
    this.logger.log('Iniciando instância compartilhada do Puppeteer...');
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
      this.logger.log('Instância do Puppeteer iniciada com sucesso.');
    } catch (error) {
      this.logger.error('Falha ao iniciar o Puppeteer na inicialização do módulo.', error.stack);

      // --- ADICIONAMOS O LOG EM FICHEIRO AQUI ---
      const logFilePath = path.join(__dirname, '..', '..', '..', 'error_log.txt');
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] FALHA NA INICIALIZAÇÃO DO PUPPETEER (onModuleInit)\nERROR: ${error.message}\nSTACK TRACE: ${error.stack}\n\n`;
      fs.appendFileSync(logFilePath, logMessage);
      // --- FIM DO LOG ---
    }
  }

  /**
   * Este método é chamado pelo NestJS quando a aplicação está sendo encerrada.
   */
  async onModuleDestroy() {
    if (this.browser) {
      this.logger.log('Fechando a instância compartilhada do Puppeteer...');
      await this.browser.close();
    }
  }

  async generatePdfFromHtml(html: string): Promise<Buffer> {
    if (!this.browser) {
      this.logger.error('A instância do Puppeteer não está disponível. Provável falha no onModuleInit.');
      throw new InternalServerErrorException('Serviço de PDF não está disponível no momento.');
    }

    let page: Page | null = null;
    try {
      page = await this.browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      return Buffer.from(pdfUint8Array);
    } catch (error) {
      this.logger.error('Erro durante a geração do PDF com Puppeteer', error.stack);

      // --- ADICIONAMOS O LOG EM FICHEIRO AQUI TAMBÉM ---
      const logFilePath = path.join(__dirname, '..', '..', '..', 'error_log.txt');
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] FALHA NA GERAÇÃO DO PDF (generatePdfFromHtml)\nERROR: ${error.message}\nSTACK TRACE: ${error.stack}\n\n`;
      fs.appendFileSync(logFilePath, logMessage);
      // --- FIM DO LOG ---

      throw new InternalServerErrorException('Falha ao gerar o relatório em PDF.');
    } finally {
      if (page) {
        await page.close();
      }
    }
  }
}