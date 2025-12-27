export type PdfResult = {
  buffer: Buffer;
  filename: string;
};

export abstract class GenerateInspectionReportUseCase {
  abstract executeHtml(inspectionId: number): Promise<string>;
  abstract executePdf(inspectionId: number): Promise<PdfResult>;
}