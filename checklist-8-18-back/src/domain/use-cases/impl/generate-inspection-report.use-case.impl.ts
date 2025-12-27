import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';
import * as path from 'path';
import { GenerateInspectionReportUseCase, PdfResult } from '../generate-inspection-report.use-case';
import { FindInspectionByIdUseCase } from '../find-inspection-by-id.use-case';
import { PdfService } from '../../../infra/pdf/pdf.service';
import { Inspection } from '../../models/inspection.model';
import * as Handlebars from 'handlebars';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';

// Constantes de IDs (Devem bater com o Banco)
const STAGE_INITIAL = 1;
const STAGE_FINAL = 2;
const STAGE_RFB = 4;   
const STAGE_ARMADOR = 5; 

const CAT_PLATE = 1;
const CAT_PANORAMIC = 2; // Usado para "Sem Precinto" e Panorâmicas gerais
// Categorias de Precinto
const CAT_PRECINTO_FRONT = 5;
const CAT_PRECINTO_REAR = 6;
const CAT_PRECINTO_LEFT = 7;
const CAT_PRECINTO_RIGHT = 8;

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório de Inspeção</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 7pt; color: #333; }
  .page { width: 210mm; min-height: 297mm; padding: 5mm; background-color: white; box-sizing: border-box; }
  table { width: 100%; border-collapse: collapse; margin-top: 3px; }
  th, td { border: 1px solid black; padding: 2px; text-align: left; vertical-align: top; }
  th { background-color: #E0E0E0; text-align: center; font-weight: bold; }
  .header-title { text-align: center; font-weight: bold; font-size: 11pt; margin-bottom: 5px; }
  .section-title { background-color: #333; color: white; text-align: center; font-weight: bold; padding: 2px; margin-top: 6px; }
  .field-label { font-weight: bold; }
  .checklist-table td:nth-child(1) { width: 55%; line-height: 1.1; }
  .checklist-table td:nth-child(2), .checklist-table td:nth-child(3), .checklist-table td:nth-child(4) { width: 15%; text-align: center; font-weight: bold; font-size: 9pt; }
  .checkbox-placeholder { font-family: 'DejaVu Sans', sans-serif; }
  
  /* Assinaturas */
  .signature-section { margin-top: 15px; padding-top: 5px; display: flex; justify-content: space-around; text-align: center; page-break-inside: avoid; }
  .signature-box { display: flex; flex-direction: column; align-items: center; min-height: 80px; width: 30%; }
  .signature-line { border-top: 1px solid black; width: 100%; margin-top: 25px; }
  .signature-caption { font-size: 7pt; margin-top: 2px; }
  .signature-image { max-height: 60px; max-width: 100%; height: auto; }
  
  /* Galerias de Fotos */
  .photo-gallery { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
  .photo-item { border: 1px solid #ccc; padding: 2px; text-align: center; width: 32%; box-sizing: border-box; page-break-inside: avoid; }
  .photo-item img { width: 100%; height: 120px; object-fit: cover; }
  .photo-caption { font-size: 6pt; margin-top: 2px; display: block; word-wrap: break-word; }

  .text-area { border: 1px solid black; min-height: 30px; padding: 3px; margin-top: 2px; word-wrap: break-word; background: #fff; }
  .no-border-table, .no-border-table td { border: none; padding: 1px; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>
<div class="page">
  <header>
      <div class="header-title">INSPEÇÃO 8/18 DE UNIDADE DE CARGA</div>
      <table class="header-table">
          <tr>
              <td><span class="field-label">INÍCIO:</span> {{data_hr_inicio}}</td>
              <td><span class="field-label">FIM INSP.:</span> {{data_hr_termino}}</td>
              <td><span class="field-label">REGISTRO:</span> {{registro_entrada}}</td>
          </tr>
          <tr>
              <td><span class="field-label">PLACAS:</span> {{placas}}</td>
              <td><span class="field-label">DOC. TRANSP.:</span> {{n_transporte}}</td>
              <td><span class="field-label">MODALIDADE:</span> {{modalidade}}</td>
          </tr>
          <tr>
              <td><span class="field-label">OPERAÇÃO:</span> {{tipo_operacao}}</td>
              <td><span class="field-label">UNIDADE:</span> {{tipo_unidade}}</td>
              <td><span class="field-label">CONTAINER:</span> {{container_number}}</td>
          </tr>
      </table>
  </header>

  <main>
      <div class="section-title">CHECKLIST DE INSPEÇÃO</div>
      <table class="checklist-table">
          <thead><tr><th>Item / Descrição</th><th>Conforme</th><th>Não Conforme</th><th>N/A</th></tr></thead>
          <tbody>
              {{#each items}}
              <tr>
                  <td><b>{{this.masterPoint.pointNumber}}. {{this.masterPoint.name}}</b><br><small>{{this.masterPoint.description}}</small></td>
                  <td><div class="checkbox-placeholder">{{{ifChecked this.statusId 2}}}</div></td>
                  <td><div class="checkbox-placeholder">{{{ifChecked this.statusId 3}}}</div></td>
                  <td><div class="checkbox-placeholder">{{{ifChecked this.statusId 4}}}</div></td>
              </tr>
              {{/each}}
          </tbody>
      </table>

      <div class="section-title">MEDIDAS E LACRES FISCAIS</div>
      <table class="sub-table">
          <tr>
              <td><span class="field-label">Comp (m):</span> {{comprimento_verificado}}</td>
              <td><span class="field-label">Larg (m):</span> {{largura_verificada}}</td>
              <td><span class="field-label">Alt (m):</span> {{altura_verificada}}</td>
          </tr>
          <tr>
              <td><span class="field-label">Lacre Armador:</span> {{lacre_armador}}</td>
              <td colspan="2"><span class="field-label">Lacre RFB:</span> {{lacre_rfb}}</td>
          </tr>
      </table>

      <div class="section-title">VERIFICAÇÃO DE SAÍDA (Portaria)</div>
      <table class="sub-table">
           <tr>
              <td><span class="field-label">Responsável:</span> {{verificacao_responsavel_nome}}</td>
              <td><span class="field-label">Data:</span> {{verificacao_data}}</td>
          </tr>
          <tr>
              <td colspan="2">
                  <table class="no-border-table">
                      <tr>
                          <td width="30%"><span class="field-label">Lacre RFB:</span></td>
                          <td>OK: <span class="checkbox-placeholder">{{{ifChecked seal_rfb_status 1}}}</span></td>
                          <td>NÃO OK: <span class="checkbox-placeholder">{{{ifChecked seal_rfb_status 2}}}</span></td>
                          <td>N/A: <span class="checkbox-placeholder">{{{ifChecked seal_rfb_status 3}}}</span></td>
                      </tr>
                      <tr>
                          <td><span class="field-label">Lacre Armador:</span></td>
                          <td>OK: <span class="checkbox-placeholder">{{{ifChecked seal_shipper_status 1}}}</span></td>
                          <td>NÃO OK: <span class="checkbox-placeholder">{{{ifChecked seal_shipper_status 2}}}</span></td>
                          <td>N/A: <span class="checkbox-placeholder">{{{ifChecked seal_shipper_status 3}}}</span></td>
                      </tr>
                      <tr>
                          <td><span class="field-label">Fita Lacre:</span></td>
                          <td>OK: <span class="checkbox-placeholder">{{{ifChecked seal_tape_status 1}}}</span></td>
                          <td>NÃO OK: <span class="checkbox-placeholder">{{{ifChecked seal_tape_status 2}}}</span></td>
                          <td>N/A: <span class="checkbox-placeholder">{{{ifChecked seal_tape_status 3}}}</span></td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>

      <div class="section-title">OBSERVAÇÕES E PROVIDÊNCIAS</div>
      <table class="sub-table">
          <tr>
              <td><span class="field-label">Observações Gerais:</span><div class="text-area">{{observations}}</div></td>
          </tr>
           <tr>
              <td><span class="field-label">Providências / Histórico:</span><div class="text-area">{{action_taken}}</div></td>
          </tr>
      </table>

      <div class="signature-section">
          <div class="signature-box">
              {{#if inspectorSignatureBase64}}
                  <img src="data:image/png;base64,{{inspectorSignatureBase64}}" class="signature-image" />
              {{else}}<div class="signature-line"></div>{{/if}}
              <div class="signature-caption">{{nome_inspetor}}<br><b>Inspetor Responsável</b></div>
          </div>
          <div class="signature-box">
              {{#if driverSignatureBase64}}
                  <img src="data:image/png;base64,{{driverSignatureBase64}}" class="signature-image" />
              {{else}}<div class="signature-line"></div>{{/if}}
              <div class="signature-caption">{{nome_motorista}}<br><b>Motorista</b></div>
          </div>
           <div class="signature-box">
               {{#if verificacao_responsavel_nome}}
                  <div style="font-size:16px; font-weight:bold; color:green; margin-top:20px;">✓ LIBERADO</div>
               {{else}}<div class="signature-line"></div>{{/if}}
               <div class="signature-caption">{{verificacao_responsavel_nome}}<br><b>Portaria / Saída</b></div>
          </div>
      </div>

      <div class="page-break"></div>
      
      {{#if (gt detailedEvidenceItems.length 0)}}
          <div class="section-title">1. EVIDÊNCIAS DA INSPEÇÃO (Checklist)</div>
          {{#each detailedEvidenceItems}}
              <div style="margin-top: 5px; page-break-inside: avoid;">
                  <b>Ponto {{this.pointNumber}}: {{this.pointName}}</b>
                  {{#if this.observations}}<br><i>Obs: {{this.observations}}</i>{{/if}}
                  {{#if (gt this.evidences.length 0)}}
                      <div class="photo-gallery">
                          {{#each this.evidences}}
                              <div class="photo-item"><img src="data:image/jpeg;base64,{{this.base64}}" /></div>
                          {{/each}}
                      </div>
                  {{/if}}
              </div>
              <hr style="border: 0; border-top: 1px dashed #ccc; margin: 5px 0;">
          {{/each}}
      {{/if}}

      <div class="section-title">2. LACRAÇÃO INICIAL (Pós-Inspeção)</div>
      <table class="sub-table"><tr><td colspan="2"><b>Lacres Aplicados:</b> {{lacres_iniciais_lista}}</td></tr></table>
      <div class="photo-gallery">
          {{#each initialSealsData}}
              <div class="photo-item">
                  <img src="data:image/jpeg;base64,{{this.base64}}" />
                  <span class="photo-caption">Lacre: {{this.number}}</span>
              </div>
          {{/each}}
          {{#each platePhotosData}}
              <div class="photo-item">
                  <img src="data:image/jpeg;base64,{{this.base64}}" />
                  <span class="photo-caption">Placa/Container</span>
              </div>
          {{/each}}
      </div>

      {{#if tem_conferencia}}
      <div class="section-title">3. CONFERÊNCIA DE CARREGAMENTO</div>
      <table class="header-table">
          <tr>
              <td><span class="field-label">INÍCIO:</span> {{data_inicio_carga}}</td>
              <td><span class="field-label">FIM:</span> {{data_fim_carga}}</td>
          </tr>
          <tr>
               <td><span class="field-label">CONFERENTE:</span> {{nome_conferente}}</td>
               <td><b>Lacres Finais:</b> {{lacres_finais_lista}}</td>
          </tr>
      </table>

      <div class="photo-gallery">
          {{#each finalSealsData}}
              <div class="photo-item">
                  <img src="data:image/jpeg;base64,{{this.base64}}" />
                  <span class="photo-caption">Lacre Final: {{this.number}}</span>
              </div>
          {{/each}}
          {{#each panoramicPhotosData}}
              <div class="photo-item">
                  <img src="data:image/jpeg;base64,{{this.base64}}" />
                  <span class="photo-caption">Panorâmica (Carga)</span>
              </div>
          {{/each}}
      </div>
      {{/if}}

      <div class="section-title">4. LACRAÇÃO RFB (Documental)</div>
      <table class="sub-table">
          <tr>
              <td><b>Lacre RFB:</b> {{rfbSealNumber}}</td>
              <td><b>Lacre Armador:</b> {{armadorSealNumber}}</td>
              <td><b>Possui Precinto?</b> {{hasPrecintoText}}</td>
          </tr>
      </table>

      <div class="photo-gallery">
          {{#if rfbSealPhoto}}
          <div class="photo-item">
             <img src="data:image/jpeg;base64,{{rfbSealPhoto}}" />
             <span class="photo-caption">Lacre RFB</span>
          </div>
          {{/if}}
          
          {{#if armadorSealPhoto}}
          <div class="photo-item">
             <img src="data:image/jpeg;base64,{{armadorSealPhoto}}" />
             <span class="photo-caption">Lacre Armador</span>
          </div>
          {{/if}}

          {{#if hasPrecinto}}
              {{#if precintoFront}}<div class="photo-item"><img src="data:image/jpeg;base64,{{precintoFront}}" /><span class="photo-caption">Precinto (Frente)</span></div>{{/if}}
              {{#if precintoRear}}<div class="photo-item"><img src="data:image/jpeg;base64,{{precintoRear}}" /><span class="photo-caption">Precinto (Traseira)</span></div>{{/if}}
              {{#if precintoLeft}}<div class="photo-item"><img src="data:image/jpeg;base64,{{precintoLeft}}" /><span class="photo-caption">Precinto (Esq.)</span></div>{{/if}}
              {{#if precintoRight}}<div class="photo-item"><img src="data:image/jpeg;base64,{{precintoRight}}" /><span class="photo-caption">Precinto (Dir.)</span></div>{{/if}}
          {{else}}
              {{#if noPrecintoPhoto}}
              <div class="photo-item">
                 <img src="data:image/jpeg;base64,{{noPrecintoPhoto}}" />
                 <span class="photo-caption">Evidência de Saída (Sem Precinto)</span>
              </div>
              {{/if}}
          {{/if}}
      </div>

  </main>
</div>
</body>
</html>
`;

@Injectable()
export class GenerateInspectionReportUseCaseImpl implements GenerateInspectionReportUseCase {
    private readonly logger = new Logger(GenerateInspectionReportUseCaseImpl.name);

    constructor(
        private readonly findInspectionByIdUseCase: FindInspectionByIdUseCase,
        private readonly pdfService: PdfService,
        @Inject(FileSystemPort)
        private readonly fileSystemPort: FileSystemPort,
        @Inject(InspectionRepositoryPort) 
        private readonly inspectionRepository: InspectionRepositoryPort,
    ) {
        this.registerHandlebarsHelpers();
    }

    async executeHtml(inspectionId: number): Promise<string> {
        this.logger.log(`Gerando HTML para a inspeção ID: ${inspectionId}`);
        return await this.getPopulatedHtml(inspectionId);
    }

    async executePdf(inspectionId: number): Promise<PdfResult> {
        this.logger.log(`Gerando PDF para a inspeção ID: ${inspectionId}`);

        // 1. Busca a inspeção
        const inspection = await this.findInspectionByIdUseCase.execute(inspectionId);

        // 2. Gera o HTML
        const populatedHtml = await this.getPopulatedHtml(inspectionId);

        // 3. Gera o Buffer
        const pdfBuffer = await this.pdfService.generatePdfFromHtml(populatedHtml);

        // 4. Gera o Nome
        const filename = this.generateStandardFilename(inspection);
        const filesDir = path.join('inspections', inspectionId.toString());

        // 5. Salva no Servidor
        const savedPath = await this.fileSystemPort.saveFile(
            filesDir,
            filename,
            pdfBuffer,
            'application/pdf'
        );

        // 6. Atualiza a Entidade
        if (inspection.generatedPdfPath !== savedPath) {
            await this.inspectionRepository.update(inspection.id, {
                generatedPdfPath: savedPath
            });
            this.logger.log(`PDF salvo e registrado em: ${savedPath}`);
        }

        return {
            buffer: pdfBuffer,
            filename: filename
        };
    }

    private async getPopulatedHtml(inspectionId: number): Promise<string> {
        const inspection = await this.findInspectionByIdUseCase.execute(inspectionId);
        const template = Handlebars.compile(HTML_TEMPLATE);
        const context = await this.prepareTemplateContext(inspection);
        return template(context);
    }

    private registerHandlebarsHelpers(): void {
        Handlebars.registerHelper('ifChecked', (statusId, expectedStatus) => statusId === expectedStatus ? 'X' : '&nbsp;');
        Handlebars.registerHelper('gt', (a, b) => a > b);
        Handlebars.registerHelper('eq', (a, b) => a === b);
        Handlebars.registerHelper('and', (a, b) => a && b);
    }

    private async prepareTemplateContext(inspection: Inspection): Promise<object> {
        const formatDate = (date: string | Date | null | undefined) =>
            date ? new Date(date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'N/A';

        // --- DADOS BÁSICOS E ASSINATURAS ---
        const inspectorSignatureBase64 = await this.convertFileToBase64(inspection.inspectorSignaturePath);
        const driverSignatureBase64 = await this.convertFileToBase64(inspection.driverSignaturePath);

        // --- CHECKLIST ---
        const itemsWithDetails = (inspection.items || []).filter(
            (item: any) => (item.observations?.trim()) || (item.evidences && item.evidences.length > 0)
        );

        const detailedEvidenceItems = await Promise.all(
            itemsWithDetails.map(async (item: any) => {
                const evidencesBase64 = await Promise.all(
                    (item.evidences || []).map(async (evidence: any) => ({
                        base64: await this.convertFileToBase64(evidence.filePath),
                        fileName: evidence.fileName
                    }))
                );
                return {
                    pointNumber: item.masterPoint?.pointNumber || '?',
                    pointName: item.masterPoint?.name || 'Item',
                    observations: item.observations,
                    evidences: evidencesBase64.filter(e => e.base64),
                };
            })
        );

        // --- FOTOS E LACRES (1:N) ---
        const images = inspection.images || [];
        const seals = inspection.seals || [];

        // 1. Lacração Inicial
        const initialSeals = seals.filter((s: any) => s.stageId === STAGE_INITIAL);
        const initialSealsData = await Promise.all(initialSeals.map(async (s: any) => ({
            number: s.sealNumber,
            base64: await this.convertFileToBase64(s.photoPath)
        })));

        const platePhotos = images.filter((i: any) => i.categoryId === CAT_PLATE);
        const platePhotosData = await Promise.all(platePhotos.map(async (i: any) => ({
            base64: await this.convertFileToBase64(i.photoPath)
        })));

        // 2. Conferência
        const finalSeals = seals.filter((s: any) => s.stageId === STAGE_FINAL);
        const finalSealsData = await Promise.all(finalSeals.map(async (s: any) => ({
            number: s.sealNumber,
            base64: await this.convertFileToBase64(s.photoPath)
        })));

        const panoramicPhotos = images.filter((i: any) => i.categoryId === CAT_PANORAMIC);
        const panoramicPhotosData = await Promise.all(panoramicPhotos.map(async (i: any) => ({
            base64: await this.convertFileToBase64(i.photoPath)
        })));

        // 3. [NOVO] Lacração RFB (Task-PORT-03)
        // Lacres
        const rfbSealObj = seals.find((s: any) => s.stageId === STAGE_RFB);
        const armadorSealObj = seals.find((s: any) => s.stageId === STAGE_ARMADOR);
        
        const rfbSealPhoto = rfbSealObj ? await this.convertFileToBase64(rfbSealObj.photoPath) : null;
        const armadorSealPhoto = armadorSealObj ? await this.convertFileToBase64(armadorSealObj.photoPath) : null;

        // Evidências de Precinto (ou Panorâmica de Saída)
        // Nota: Se não tem precinto, a lógica manda para CAT_PANORAMIC (ID 2).
        // Aqui buscamos explicitamente as categorias 5,6,7,8 para Precinto.
        // E usamos a categoria 2 como fallback se hasPrecinto = false.
        
        const precintoFrontObj = images.find(i => i.categoryId === CAT_PRECINTO_FRONT);
        const precintoRearObj = images.find(i => i.categoryId === CAT_PRECINTO_REAR);
        const precintoLeftObj = images.find(i => i.categoryId === CAT_PRECINTO_LEFT);
        const precintoRightObj = images.find(i => i.categoryId === CAT_PRECINTO_RIGHT);
        
        // Se NÃO tem precinto, a evidência é salva como CAT_PANORAMIC (ID 2).
        // Como o ID 2 também é usado na conferência, pegamos a ÚLTIMA foto panorâmica adicionada, 
        // ou todas as panorâmicas (o template já mostra todas no loop de conferência, 
        // mas aqui queremos uma específica para a seção RFB se não tiver precinto).
        // Para simplificar: Se hasPrecinto == false, mostramos a última foto panorâmica adicionada.
        const noPrecintoObj = !inspection.hasPrecinto && panoramicPhotos.length > 0 
            ? panoramicPhotos[panoramicPhotos.length - 1] // Assume a última como sendo a da etapa RFB
            : null;

        return {
            // ... Cabeçalho ...
            data_hr_inicio: formatDate(inspection.startDatetime),
            data_hr_termino: formatDate(inspection.endDatetime),
            registro_entrada: inspection.entryRegistration || 'N/A',
            placas: inspection.vehiclePlates || 'N/A',
            n_transporte: inspection.transportDocument || 'N/A',
            modalidade: inspection.modality?.name || 'N/A',
            tipo_operacao: inspection.operationType?.name || 'N/A',
            tipo_unidade: inspection.unitType?.name || 'N/A',
            tipo_container: inspection.containerType?.name || 'N/A',
            container_number: inspection.containerNumber || 'N/A',

            items: inspection.items,

            comprimento_verificado: inspection.verifiedLength ?? 'N/A',
            largura_verificada: inspection.verifiedWidth ?? 'N/A',
            altura_verificada: inspection.verifiedHeight ?? 'N/A',
            lacre_armador: inspection.sealShipper || 'N/A',
            lacre_rfb: inspection.sealRfb || 'N/A',

            verificacao_responsavel_nome: inspection.sealVerificationResponsibleName || '',
            verificacao_data: formatDate(inspection.sealVerificationDate),
            seal_rfb_status: inspection.sealVerificationRfbStatusId,
            seal_shipper_status: inspection.sealVerificationShipperStatusId,
            seal_tape_status: inspection.sealVerificationTapeStatusId,

            observations: inspection.observations || 'Nenhuma observação geral.',
            action_taken: inspection.actionTaken || 'Nenhuma providência tomada.',

            nome_inspetor: inspection.inspector?.fullName ?? 'Inspetor',
            nome_motorista: inspection.driverName,
            inspectorSignatureBase64,
            driverSignatureBase64,

            detailedEvidenceItems,
            
            initialSealsData,
            lacres_iniciais_lista: initialSeals.map((s: any) => s.sealNumber).join(', ') || 'Nenhum',
            platePhotosData,

            tem_conferencia: !!inspection.conferenceStartedAt,
            data_inicio_carga: formatDate(inspection.conferenceStartedAt),
            data_fim_carga: formatDate(inspection.conferenceEndedAt),
            nome_conferente: inspection.conferente?.fullName || 'N/A',
            finalSealsData,
            lacres_finais_lista: finalSeals.map((s: any) => s.sealNumber).join(', ') || 'Nenhum',
            panoramicPhotosData,

            // --- [DADOS NOVOS RFB] ---
            hasPrecinto: inspection.hasPrecinto,
            hasPrecintoText: inspection.hasPrecinto ? 'SIM' : 'NÃO',
            rfbSealNumber: rfbSealObj ? rfbSealObj.sealNumber : 'N/A',
            armadorSealNumber: armadorSealObj ? armadorSealObj.sealNumber : 'N/A',
            
            rfbSealPhoto,
            armadorSealPhoto,
            
            precintoFront: precintoFrontObj ? await this.convertFileToBase64(precintoFrontObj.photoPath) : null,
            precintoRear: precintoRearObj ? await this.convertFileToBase64(precintoRearObj.photoPath) : null,
            precintoLeft: precintoLeftObj ? await this.convertFileToBase64(precintoLeftObj.photoPath) : null,
            precintoRight: precintoRightObj ? await this.convertFileToBase64(precintoRightObj.photoPath) : null,
            
            noPrecintoPhoto: noPrecintoObj ? await this.convertFileToBase64(noPrecintoObj.photoPath) : null,
        };
    }

    private generateStandardFilename(inspection: Inspection): string {
        const cleanReg = (inspection.entryRegistration || 'SEM_RE').replace(/[^a-zA-Z0-9]/g, '');
        const cleanPlate = (inspection.vehiclePlates || 'SEM_PLACA').replace(/[^a-zA-Z0-9]/g, '');
        const dateRef = inspection.endDatetime || new Date();
        const timestamp = dateRef.toISOString().replace(/[-:T.]/g, '').slice(0, 12); // YYYYMMDDHHMM
        return `${cleanReg}_${cleanPlate}_${timestamp}.pdf`;
    }

    private async convertFileToBase64(filePath: string | null | undefined): Promise<string | null> {
        if (!filePath) return null;
        try {
            const fileBuffer = await this.fileSystemPort.readFile(filePath);
            return fileBuffer.toString('base64');
        } catch (error) {
            this.logger.warn(`Falha ao ler arquivo para PDF: ${filePath}`);
            return null;
        }
    }
}