import {
  Controller, Res, Delete, Get, Post, Body, HttpCode, HttpStatus,
  Patch, Param, ParseIntPipe, UseInterceptors, UploadedFile,
  HttpException, NotFoundException, Logger, Header, StreamableFile,
  UseGuards, Req,
  UploadedFiles, Inject, ValidationPipe,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { InternalServerErrorException } from '@nestjs/common';

// pipes
import { EmptyBodyValidationPipe } from '../pipes/empty-body-validation.pipe';

// DTOs
import { CreateInspectionDto } from '../dtos/create-inspection.dto';
import { UpdateInspectionChecklistItemDto } from '../dtos/update-inspection-checklist-item.dto';
import { UpdateInspectionDto } from '../dtos/update-inspection.dto';
import { DeleteEvidenceDto } from '../dtos/delete-evidence.dto';
import { AttachSignaturesDto } from '../dtos/attach-signatures.dto';
import { AttachDriverSignatureDto } from '../dtos/attach-driver-signature.dto';
import { FinalizeInspectionDto } from '../dtos/finalize-inspection.dto';
import { OverrideInspectionDto } from '../dtos/override-inspection.dto';
import { SealInitialDto } from '../dtos/seal-initial.dto';
import { UpdateSealDto } from '../dtos/update-seal.dto';
import { UpdateInspectionImageDto } from '../dtos/update-inspection-image.dto';
import { FinishLoadingDto } from '../dtos/finish-loading.dto';

// Use Cases
import { CreateInspectionUseCase } from 'src/domain/use-cases/create-inspection.use-case';
import { UpdateInspectionChecklistItemUseCase } from 'src/domain/use-cases/update-inspection-checklist-item.use-case';
import { UploadEvidenceUseCase } from 'src/domain/use-cases/upload-evidence.use-case';
import { FinalizeInspectionUseCase } from 'src/domain/use-cases/finalize-inspection.use-case';
import { FindAllInspectionsUseCase } from 'src/domain/use-cases/find-all-inspections.use-case';
import { FindInspectionByIdUseCase } from 'src/domain/use-cases/find-inspection-by-id.use-case';
import { GenerateInspectionReportUseCase } from 'src/domain/use-cases/generate-inspection-report.use-case';
import { CheckForExistingInspectionUseCase } from 'src/domain/use-cases/check-for-existing-inspection.use-case';
import { UpdateInspectionUseCase } from 'src/domain/use-cases/update-inspection.use-case';
import { DeleteInspectionUseCase } from 'src/domain/use-cases/delete-inspection.use-case';
import { DeleteEvidenceUseCase } from 'src/domain/use-cases/delete-evidence.use-case';
import { DownloadEvidenceUseCase } from 'src/domain/use-cases/download-evidence.use-case';
import { AttachSignaturesUseCase } from 'src/domain/use-cases/attach-signatures.use-case';
import { AssignInspectionUseCase } from 'src/domain/use-cases/assign-inspection.use-case';
import { AttachDriverSignatureUseCase } from 'src/domain/use-cases/attach-driver-signature.use-case';
import { OverrideInspectionUseCase } from 'src/domain/use-cases/override-inspection.use-case';
import { SealInitialUseCase } from 'src/domain/use-cases/seal-initial.use-case';
import { DeleteSealUseCase } from 'src/domain/use-cases/delete-seal.use-case';
import { DeleteInspectionImageUseCase } from 'src/domain/use-cases/delete-inspection-image.use-case';
import { UpdateSealUseCase } from 'src/domain/use-cases/update-seal.use-case';
import { UpdateInspectionImageUseCase } from 'src/domain/use-cases/update-inspection-image.use-case';
import { StartLoadingUseCase } from '@domain/use-cases/start-loading.use-case';
import { FinishLoadingUseCase } from 'src/domain/use-cases/finish-loading.use-case';
import { DeleteConferenceSealUseCase } from 'src/domain/use-cases/delete-conference-seal.use-case';
import { DeleteConferenceImageUseCase } from 'src/domain/use-cases/delete-conference-image.use-case';
import { UpdateConferenceSealUseCase } from 'src/domain/use-cases/update-conference-seal.use-case';
import { UpdateConferenceImageUseCase } from 'src/domain/use-cases/update-conference-image.use-case';
import { AddRfbSealUseCase } from 'src/domain/use-cases/add-rfb-seal.use-case';

// Models, Guards e Decorators
import { Inspection } from 'src/domain/models/inspection.model';
import { InspectionChecklistItem } from 'src/domain/models/inspection-checklist-item.model';
import { ItemEvidence } from 'src/domain/models/item-evidence.model';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RoleName } from '@domain/models/role.model';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AddRfbSealDto } from '../dtos/add-rfb-seal.dto';

@ApiTags('Inspections')
@Controller('inspections')
export class InspectionController {
  private readonly logger = new Logger(InspectionController.name);
  constructor(
    private readonly createInspectionUseCase: CreateInspectionUseCase,
    private readonly updateItemUseCase: UpdateInspectionChecklistItemUseCase,
    private readonly uploadEvidenceUseCase: UploadEvidenceUseCase,
    private readonly finalizeInspectionUseCase: FinalizeInspectionUseCase,
    private readonly findAllInspectionsUseCase: FindAllInspectionsUseCase,
    private readonly findInspectionByIdUseCase: FindInspectionByIdUseCase,
    private readonly generateReportUseCase: GenerateInspectionReportUseCase,
    private readonly checkForExistingUseCase: CheckForExistingInspectionUseCase,
    private readonly updateInspectionUseCase: UpdateInspectionUseCase,
    private readonly deleteInspectionUseCase: DeleteInspectionUseCase,
    private readonly deleteEvidenceUseCase: DeleteEvidenceUseCase,
    private readonly downloadEvidenceUseCase: DownloadEvidenceUseCase,
    private readonly attachSignaturesUseCase: AttachSignaturesUseCase,
    private readonly assignInspectionUseCase: AssignInspectionUseCase,
    private readonly attachDriverSignatureUseCase: AttachDriverSignatureUseCase,
    private readonly overrideInspectionUseCase: OverrideInspectionUseCase,
    private readonly sealInitialUseCase: SealInitialUseCase,
    private readonly deleteSealUseCase: DeleteSealUseCase,
    private readonly deleteInspectionImageUseCase: DeleteInspectionImageUseCase,
    private readonly updateSealUseCase: UpdateSealUseCase,
    private readonly updateInspectionImageUseCase: UpdateInspectionImageUseCase,
    private readonly startLoadingUseCase: StartLoadingUseCase,
    private readonly finishLoadingUseCase: FinishLoadingUseCase,
    private readonly deleteConferenceSealUseCase: DeleteConferenceSealUseCase,
    private readonly deleteConferenceImageUseCase: DeleteConferenceImageUseCase,
    private readonly updateConferenceSealUseCase: UpdateConferenceSealUseCase,
    private readonly updateConferenceImageUseCase: UpdateConferenceImageUseCase,
    private readonly addRfbSealUseCase: AddRfbSealUseCase,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Listar todas as inspeções' })
  @ApiResponse({ status: 200, type: [Inspection] })
  async findAll(): Promise<Inspection[]> {
    return this.findAllInspectionsUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma única inspeção por seu ID' })
  @ApiResponse({ status: 200, type: Inspection })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Inspection> {
    return this.findInspectionByIdUseCase.execute(id);
  }

  @Post('check-existing')
  @ApiOperation({ summary: 'Verifica se uma inspeção similar já existe' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async checkExisting(@Body() dto: CreateInspectionDto): Promise<Inspection> {
    const existingInspection = await this.checkForExistingUseCase.execute(dto);
    if (!existingInspection) {
      throw new NotFoundException('Nenhuma inspeção similar em andamento foi encontrada.');
    }
    return existingInspection;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar uma nova inspeção',
    description: 'Cria uma nova inspeção e gera 18 itens de checklist para a modalidade Rodoviário ou 11 para as modalidades Marítimo/Aéreo.'
  })
  @ApiResponse({ status: 201, description: 'Inspeção criada com sucesso.', type: Inspection })
  @ApiResponse({ status: 400, description: 'Ocorre se os dados fornecidos forem inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInspectionDto: CreateInspectionDto): Promise<Inspection> {
    return this.createInspectionUseCase.execute(createInspectionDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os atributos de uma inspeção' })
  @ApiResponse({ status: 200, type: Inspection })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(EmptyBodyValidationPipe) dto: UpdateInspectionDto
  ): Promise<Inspection> {
    return this.updateInspectionUseCase.execute(id, dto);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(RoleName.INSPECTOR) // Apenas Inspetores podem assumir uma inspeção
  @ApiOperation({ summary: 'Atribui uma inspeção a um inspetor.' })
  @ApiResponse({ status: 200, description: 'Inspeção atribuída com sucesso.', type: Inspection })
  @ApiResponse({ status: 400, description: 'A inspeção não pode ser atribuída (ex: já está em andamento ou foi assumida).' })
  @ApiResponse({ status: 403, description: 'Acesso negado (Função não permitida).' })
  @ApiResponse({ status: 404, description: 'Inspeção não encontrada.' })
  async assign(
    @Param('id', ParseIntPipe) inspectionId: number,
    @Req() req: { user: { userId: number } },
  ): Promise<Inspection> {
    const inspectorId = req.user.userId;
    return this.assignInspectionUseCase.execute(inspectionId, inspectorId);
  }

  @Patch(':inspectionId/points/:pointNumber')
  @ApiOperation({ summary: 'Atualizar o status e observações de um item do checklist' })
  @ApiResponse({ status: 200, type: InspectionChecklistItem })
  async updateItem(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('pointNumber', ParseIntPipe) pointNumber: number,
    @Body() updateDto: UpdateInspectionChecklistItemDto,
  ): Promise<InspectionChecklistItem> {
    return this.updateItemUseCase.execute(inspectionId, pointNumber, updateDto);
  }

  @Post(':inspectionId/points/:pointNumber/evidence')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Anexar uma evidência (imagem) a um item do checklist' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: ItemEvidence })
  async uploadEvidence(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('pointNumber', ParseIntPipe) pointNumber: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ItemEvidence> {
    this.logger.debug({ message: 'Objeto FILE recebido no Controller', file });
    if (!file) {
      throw new HttpException('Arquivo não enviado ou o tipo não é suportado (apenas imagens).', HttpStatus.BAD_REQUEST);
    }
    return this.uploadEvidenceUseCase.execute(inspectionId, pointNumber, file);
  }

  @Delete(':inspectionId/points/:pointNumber/evidence')
  @ApiOperation({ summary: 'Apagar uma evidência (imagem) específica de um ponto' })
  @ApiResponse({ status: 200, description: 'Evidência apagada com sucesso.' })
  async deleteEvidence(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('pointNumber', ParseIntPipe) pointNumber: number,
    @Body() dto: DeleteEvidenceDto,
  ): Promise<{ message: string }> {
    await this.deleteEvidenceUseCase.execute(inspectionId, pointNumber, dto.fileName);
    return { message: `Evidência "${dto.fileName}" apagada com sucesso.` };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Apagar uma inspeção (apenas se estiver "EM INSPEÇÃO")' })
  @ApiResponse({ status: 200, description: 'Inspeção apagada com sucesso.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.deleteInspectionUseCase.execute(id);
    return { message: `Inspeção com ID ${id} apagada com sucesso.` };
  }

  @Patch(':id/finalize')
  @UseGuards(JwtAuthGuard, RolesGuard) // Protegido por Admin ou Inspetor
  @Roles(RoleName.ADMIN, RoleName.INSPECTOR)
  @ApiBearerAuth()
  // 1. Usamos o Interceptor para os campos de ficheiro
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'sealPhoto', maxCount: 1 },
    { name: 'platePhoto', maxCount: 1 },
  ]))
  @ApiConsumes('multipart/form-data') // 2. Informamos ao Swagger que é multipart
  @ApiOperation({
    summary: 'Finalizar uma inspeção',
    description: 'Finaliza a inspeção, submetendo o número do lacre e as fotos obrigatórias. Verifica se a assinatura do motorista já foi anexada.'
  })
  @ApiBody({ // 3. Documentamos o DTO e os ficheiros
    description: 'Dados de finalização, incluindo o número do lacre e as fotos.',
    type: FinalizeInspectionDto,
    schema: {
      type: 'object',
      properties: {
        sealUagaPostInspection: { type: 'string' },
        sealPhoto: { type: 'string', format: 'binary' },
        platePhoto: { type: 'string', format: 'binary' },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Inspeção finalizada com sucesso.', type: Inspection })
  @ApiResponse({ status: 404, description: 'Inspeção não encontrada.' })
  @ApiResponse({ status: 400, description: 'A inspeção não pode ser finalizada (ex: falta de assinatura do motorista, fotos obrigatórias, etc.).' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async finalize(
    @Param('id', ParseIntPipe) inspectionId: number,

    // --- INÍCIO DA CORREÇÃO ---
    // Usamos um Pipe local que NÃO proíbe campos extras (os arquivos)
    @Body(new ValidationPipe({
      transform: true,
      whitelist: true, // Garante que SÓ os campos do DTO entrem no 'dto'
      forbidNonWhitelisted: false // NÃO proíbe os campos de arquivo no FormData
    }))
    dto: FinalizeInspectionDto, // 4. Recebemos o DTO
    // --- FIM DA CORREÇÃO ---

    @UploadedFiles() files: { // 5. Recebemos os ficheiros
      sealPhoto: Express.Multer.File[];
      platePhoto: Express.Multer.File[];
    },
  ): Promise<Inspection> {
    // 6. Passamos tudo para o UseCase
    return this.finalizeInspectionUseCase.execute(inspectionId, dto, files);
  }

  @Get(':id/report/pdf')
  @ApiOperation({
    summary: 'Gerar e baixar o relatório de uma inspeção em PDF',
    description: `... (descrição mantida) ...`,
  })
  @ApiResponse({ status: 200, description: 'O relatório em PDF é retornado com sucesso.' })
  @ApiResponse({ status: 400, description: 'A inspeção não está num estado válido para gerar um relatório.' })
  @ApiResponse({ status: 500, description: 'Falha na geração do PDF no servidor...' })
  async generateReportPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      // Desestruturamos o objeto para pegar o buffer E o nome do arquivo
      const { buffer, filename } = await this.generateReportUseCase.executePdf(id);

      res.setHeader('Content-Type', 'application/pdf');

      // Usamos o filename gerado pelo Backend (ex: RE123_ABC999_DATA.pdf)
      // em vez do hardcoded "inspecao-{id}.pdf"
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Passamos apenas o buffer para o StreamableFile
      return new StreamableFile(buffer);

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Falha inesperada ao gerar PDF para inspeção ${id}:`, error.stack);

      // Lógica de log em arquivo mantida...
      const logFilePath = path.join(__dirname, '..', '..', '..', 'error_log.txt');
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] FALHA INESPERADA AO GERAR PDF (inspecaoId: ${id})\nERROR: ${error.message}\nSTACK TRACE: ${error.stack}\n\n`;

      try {
        fs.appendFileSync(logFilePath, logMessage);
      } catch (logError) {
        this.logger.error('CRÍTICO: Falha ao escrever no ficheiro de log.', logError);
      }

      throw new InternalServerErrorException('Serviço de PDF não está disponível no momento.');
    }
  }

  @Get(':id/report/html')
  @ApiOperation({ summary: 'Obter a versão HTML do relatório para pré-visualização' })
  @ApiResponse({ status: 200, description: 'Retorna o HTML do relatório.' })
  @Header('Content-Type', 'text/html')
  async generateReportHtml(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.generateReportUseCase.executeHtml(id);
  }

  @Get(':inspectionId/points/:pointNumber/evidence/:fileName')
  @ApiOperation({ summary: 'Baixar um arquivo de evidência específico' })
  @ApiResponse({ status: 200, description: 'Retorna o arquivo de evidência.' })
  @ApiResponse({ status: 404, description: 'Evidência não encontrada.' })
  async downloadEvidence(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('pointNumber', ParseIntPipe) pointNumber: number,
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { buffer, mimeType, fileName: downloadedFileName } = await this.downloadEvidenceUseCase.execute(
      inspectionId,
      pointNumber,
      fileName,
    );

    res.setHeader('Content-Type', mimeType);
    // Assegura que o navegador trate a resposta como um anexo para download
    res.setHeader('Content-Disposition', `attachment; filename="${downloadedFileName}"`);

    return new StreamableFile(buffer);
  }

  @Post(':id/signatures')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'inspectorSignature', maxCount: 1 },
    { name: 'driverSignature', maxCount: 1 },
    { name: 'checkerSignature', maxCount: 1 },
  ]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Anexa as assinaturas a uma inspeção.' })
  @ApiBody({
    description: 'Upload das assinaturas e opções. Todos os campos são opcionais, mas pelo menos uma assinatura deve ser fornecida (seja via ficheiro ou `useProfileSignature`).',
    type: AttachSignaturesDto,
    schema: {
      type: 'object',
      properties: {
        useProfileSignature: { type: 'boolean', nullable: true },
        inspectorSignature: { type: 'string', format: 'binary', nullable: true },
        driverSignature: { type: 'string', format: 'binary', nullable: true },
        checkerSignature: { type: 'string', format: 'binary', nullable: true },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Assinaturas anexadas com sucesso.', type: Inspection })
  @HttpCode(HttpStatus.OK)
  async attachSignatures(
    @Param('id', ParseIntPipe) inspectionId: number,
    @Req() req: { user: { userId: number } },
    @Body() dto: AttachSignaturesDto,
    @UploadedFiles() files: {
      inspectorSignature?: Express.Multer.File[],
      driverSignature?: Express.Multer.File[],
      checkerSignature?: Express.Multer.File[],
    },
  ): Promise<Inspection> {
    const { userId } = req.user;
    return this.attachSignaturesUseCase.execute(userId, inspectionId, dto, files);
  }

  @Post(':id/driver-signature')
  @UseGuards(JwtAuthGuard) // Protegido, apenas usuários logados podem anexar
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Anexa a assinatura do motorista a uma inspeção.' })
  @ApiResponse({ status: 200, description: 'Assinatura do motorista anexada com sucesso.', type: Inspection })
  @ApiResponse({ status: 400, description: 'Formato de base64 inválido.' })
  @ApiResponse({ status: 404, description: 'Inspeção não encontrada.' })
  @HttpCode(HttpStatus.OK)
  async attachDriverSignature(
    @Param('id', ParseIntPipe) inspectionId: number,
    @Body() dto: AttachDriverSignatureDto,
  ): Promise<Inspection> {
    return this.attachDriverSignatureUseCase.execute(inspectionId, dto);
  }

  @Post(':id/override-approval')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.DOCUMENTAL) // Restrição de Segurança: Apenas Documental/Admin
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Realizar Override de Aprovação (Documental)',
    description: 'Permite que o Documental force a aprovação de uma inspeção REPROVADA (Status 3), movendo-a para APROVADO COM RESSALVAS (Status 8), mediante justificativa obrigatória.'
  })
  @ApiBody({ type: OverrideInspectionDto })
  @ApiResponse({ status: 200, description: 'Override realizado com sucesso.', type: Inspection })
  @ApiResponse({ status: 400, description: 'A inspeção não está no status REPROVADO ou justificativa inválida.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (Usuário não tem permissão).' })
  @ApiResponse({ status: 404, description: 'Inspeção não encontrada.' })
  @HttpCode(HttpStatus.OK)
  async overrideApproval(
    @Param('id', ParseIntPipe) inspectionId: number,
    @Req() req: { user: { userId: number } }, // Obtém o ID do usuário logado para auditoria
    @Body() dto: OverrideInspectionDto,
  ): Promise<Inspection> {
    const userId = req.user.userId;
    return this.overrideInspectionUseCase.execute(inspectionId, userId, dto);
  }

  @Patch(':id/seal-initial')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.INSPECTOR) // Apenas Inspetores realizam a lacração inicial
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'sealPhotos', maxCount: 3 },  // Aceita até 3 fotos de lacre
    { name: 'platePhotos', maxCount: 3 }, // Aceita até 3 fotos de placa
  ]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Realizar Lacração Inicial (Pós-Inspeção)',
    description: 'Salva múltiplas fotos de lacres e placas de forma transacional e move a inspeção para AGUARDANDO_CONFERENCIA (7). Requer status APROVADO (2) ou APROVADO_COM_RESSALVAS (8).'
  })
  @ApiBody({
    description: 'Dados da lacração. A lista de sealNumbers deve corresponder à ordem das fotos enviadas.',
    type: SealInitialDto,
  })
  @ApiResponse({ status: 200, description: 'Lacração realizada com sucesso.', type: Inspection })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou quantidade de arquivos incorreta.' })
  @ApiResponse({ status: 403, description: 'Status da inspeção não permite lacração.' })
  @ApiResponse({ status: 404, description: 'Inspeção não encontrada.' })
  async sealInitial(
    @Param('id', ParseIntPipe) inspectionId: number,
    @Body(new ValidationPipe({ transform: true })) dto: SealInitialDto,
    @UploadedFiles() files: {
      sealPhotos: Express.Multer.File[];
      platePhotos: Express.Multer.File[];
    },
  ): Promise<Inspection> {
    // Delega para o UseCase transacional
    return this.sealInitialUseCase.execute(inspectionId, dto, files);
  }

  @Delete(':inspectionId/seals/:sealId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.INSPECTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover um lacre da inspeção (Apenas se AGUARDANDO_CONFERENCIA)' })
  @ApiResponse({ status: 200, description: 'Lacre removido com sucesso.' })
  @ApiResponse({ status: 403, description: 'Operação não permitida neste status.' })
  @ApiResponse({ status: 404, description: 'Lacre ou inspeção não encontrados.' })
  async deleteSeal(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('sealId', ParseIntPipe) sealId: number,
  ): Promise<{ message: string }> {
    await this.deleteSealUseCase.execute(inspectionId, sealId);
    return { message: `Lacre ${sealId} removido com sucesso.` };
  }

  @Delete(':inspectionId/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.INSPECTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover uma imagem/placa da inspeção (Apenas se AGUARDANDO_CONFERENCIA)' })
  @ApiResponse({ status: 200, description: 'Imagem removida com sucesso.' })
  @ApiResponse({ status: 403, description: 'Operação não permitida neste status.' })
  @ApiResponse({ status: 404, description: 'Imagem ou inspeção não encontradas.' })
  async deleteInspectionImage(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<{ message: string }> {
    await this.deleteInspectionImageUseCase.execute(inspectionId, imageId);
    return { message: `Imagem ${imageId} removida com sucesso.` };
  }

  @Patch(':inspectionId/seals/:sealId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.INSPECTOR)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('photo')) // Arquivo opcional 'photo'
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Corrigir um lacre (número ou foto)',
    description: 'Permite corrigir erro de digitação no número ou substituir a foto do lacre. Apenas se AGUARDANDO_CONFERENCIA.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sealNumber: { type: 'string', description: 'Novo número (opcional)' },
        photo: { type: 'string', format: 'binary', description: 'Nova foto (opcional)' },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Lacre atualizado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Operação não permitida neste status.' })
  async updateSeal(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('sealId', ParseIntPipe) sealId: number,
    @Body() dto: UpdateSealDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.updateSealUseCase.execute(inspectionId, sealId, dto, file);
  }

  @Patch(':inspectionId/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.INSPECTOR)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Corrigir uma imagem/placa',
    description: 'Permite alterar a descrição ou substituir a foto. Apenas se AGUARDANDO_CONFERENCIA.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Nova descrição (opcional)' },
        photo: { type: 'string', format: 'binary', description: 'Nova foto (opcional)' },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Imagem atualizada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Operação não permitida neste status.' })
  async updateInspectionImage(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() dto: UpdateInspectionImageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.updateInspectionImageUseCase.execute(inspectionId, imageId, dto, file);
  }

  @Patch(':id/start-loading')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.CONFERENTE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Iniciar Carregamento (Check-in Conferente)',
    description: 'Registra o início da operação do conferente (timestamp), muda o status para EM_CONFERENCIA (5) e retorna os dados para conferência visual dos lacres iniciais.'
  })
  @ApiResponse({ status: 200, description: 'Operação iniciada com sucesso.', type: Inspection })
  @ApiResponse({ status: 403, description: 'Status inválido (A inspeção deve estar AGUARDANDO_CONFERENCIA).' })
  @ApiResponse({ status: 404, description: 'Inspeção não encontrada.' })
  async startLoading(
    @Param('id', ParseIntPipe) inspectionId: number,
    @Req() req: { user: { userId: number } },
  ): Promise<Inspection> {
    const conferenteId = req.user.userId;
    return this.startLoadingUseCase.execute(inspectionId, conferenteId);
  }

  @Post(':id/finish-loading')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.CONFERENTE)
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'finalSealPhotos', maxCount: 3 },
    { name: 'panoramicPhotos', maxCount: 3 },
  ]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Finalizar Carregamento (Relacre Final)',
    description: 'Salva os lacres finais, fotos panorâmicas e define se há PRECINTO. Encerra a conferência (Status 6).'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['hasPrecinto'],
      properties: {
        hasPrecinto: {
          type: 'boolean',
          description: 'Indica se foi colocado Precinto Eletrônico (TRUE/FALSE).',
          default: false
        },
        finalSealNumbers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de números dos lacres finais.'
        },
        finalSealPhotos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Fotos dos lacres finais (Max 3).'
        },
        panoramicPhotos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Fotos panorâmicas da carga (Max 3).'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Carregamento finalizado com sucesso.', type: Inspection })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou arquivos faltando.' })
  async finishLoading(
    @Param('id', ParseIntPipe) inspectionId: number,
    @Req() req: { user: { userId: number } },
    @Body(new ValidationPipe({ transform: true })) dto: FinishLoadingDto,
    @UploadedFiles() files: {
      finalSealPhotos: Express.Multer.File[];
      panoramicPhotos: Express.Multer.File[];
    },
  ): Promise<Inspection> {
    const conferenteId = req.user.userId;
    return this.finishLoadingUseCase.execute(inspectionId, conferenteId, dto, files);
  }

  // ---------------------------------------------------------------------------
  // GESTÃO DE LACRES - CONFERENTE (Delete/Update)
  // ---------------------------------------------------------------------------

  @Delete(':inspectionId/conference-seals/:sealId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.CONFERENTE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover um lacre final (Apenas se EM_CONFERENCIA)' })
  @ApiResponse({ status: 200, description: 'Lacre removido com sucesso.' })
  @ApiResponse({ status: 403, description: 'Operação não permitida neste status (Deve ser 5).' })
  async deleteConferenceSeal(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('sealId', ParseIntPipe) sealId: number,
  ): Promise<{ message: string }> {
    await this.deleteConferenceSealUseCase.execute(inspectionId, sealId);
    return { message: `Lacre final ${sealId} removido com sucesso.` };
  }

  @Patch(':inspectionId/conference-seals/:sealId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.CONFERENTE)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Corrigir um lacre final (número ou foto)',
    description: 'Permite corrigir erro de digitação ou substituir a foto. Apenas se EM_CONFERENCIA.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sealNumber: { type: 'string', description: 'Novo número (opcional)' },
        photo: { type: 'string', format: 'binary', description: 'Nova foto (opcional)' },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Lacre atualizado.' })
  async updateConferenceSeal(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('sealId', ParseIntPipe) sealId: number,
    @Body() dto: UpdateSealDto, // Reutilizamos o DTO pois os campos são os mesmos
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.updateConferenceSealUseCase.execute(inspectionId, sealId, dto, file);
  }

  // ---------------------------------------------------------------------------
  // GESTÃO DE IMAGENS - CONFERENTE (Delete/Update)
  // ---------------------------------------------------------------------------

  @Delete(':inspectionId/conference-images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.CONFERENTE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover uma foto panorâmica (Apenas se EM_CONFERENCIA)' })
  @ApiResponse({ status: 200, description: 'Imagem removida com sucesso.' })
  async deleteConferenceImage(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<{ message: string }> {
    await this.deleteConferenceImageUseCase.execute(inspectionId, imageId);
    return { message: `Imagem panorâmica ${imageId} removida com sucesso.` };
  }

  @Patch(':inspectionId/conference-images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.CONFERENTE)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Corrigir uma foto panorâmica',
    description: 'Permite alterar a descrição ou substituir a foto. Apenas se EM_CONFERENCIA.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Nova descrição (opcional)' },
        photo: { type: 'string', format: 'binary', description: 'Nova foto (opcional)' },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Imagem atualizada.' })
  async updateConferenceImage(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() dto: UpdateInspectionImageDto, // Reutilizamos o DTO
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.updateConferenceImageUseCase.execute(inspectionId, imageId, dto, file);
  }

  @Post(':id/rfb-seal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.DOCUMENTAL, RoleName.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'rfbPhoto', maxCount: 1 },         // Obrigatório
      { name: 'armadorPhoto', maxCount: 1 },     // Opcional
      // CAMPOS (TASK-RFB-03)
      { name: 'precintoFront', maxCount: 1 },    // Obrigatório se hasPrecinto=true
      { name: 'precintoRear', maxCount: 1 },     // Obrigatório se hasPrecinto=true
      { name: 'precintoLeft', maxCount: 1 },     // Obrigatório se hasPrecinto=true
      { name: 'precintoRight', maxCount: 1 },    // Obrigatório se hasPrecinto=true
      { name: 'noPrecintoPhoto', maxCount: 1 },  // Obrigatório se hasPrecinto=false
    ]),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Registrar lacração fiscal (RFB/Armador) + Evidências de Saída' })
  @ApiResponse({ status: 201, description: 'Lacração registrada e inspeção movida para AGUARDANDO_SAIDA.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou foto obrigatória faltando.' })
  async addRfbSeal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddRfbSealDto,
    @UploadedFiles() files: {
      rfbPhoto?: Express.Multer.File[],
      armadorPhoto?: Express.Multer.File[],
      precintoFront?: Express.Multer.File[],
      precintoRear?: Express.Multer.File[],
      precintoLeft?: Express.Multer.File[],
      precintoRight?: Express.Multer.File[],
      noPrecintoPhoto?: Express.Multer.File[]
    },
  ) {
    // Validação Manual de Arquivo Obrigatório (Safety Net)
    if (!files || !files.rfbPhoto || files.rfbPhoto.length === 0) {
      throw new BadRequestException('A foto do lacre RFB é obrigatória.');
    }

    return this.addRfbSealUseCase.execute(id, dto, {
      rfbPhoto: files.rfbPhoto,
      armadorPhoto: files.armadorPhoto,
      precintoFront: files.precintoFront,
      precintoRear: files.precintoRear,
      precintoLeft: files.precintoLeft,
      precintoRight: files.precintoRight,
      noPrecintoPhoto: files.noPrecintoPhoto
    });
  }
}
