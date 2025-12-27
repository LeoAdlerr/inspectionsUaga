import { CreateInspectionUseCase } from '@domain/use-cases/create-inspection.use-case';
import { UpdateInspectionChecklistItemUseCase } from '@domain/use-cases/update-inspection-checklist-item.use-case';
import { DownloadEvidenceUseCase } from '@domain/use-cases/download-evidence.use-case';
import { UploadEvidenceUseCase } from '@domain/use-cases/upload-evidence.use-case';
import { FinalizeInspectionUseCase } from '@domain/use-cases/finalize-inspection.use-case';
import { FindAllInspectionsUseCase } from '@domain/use-cases/find-all-inspections.use-case';
import { FindInspectionByIdUseCase } from '@domain/use-cases/find-inspection-by-id.use-case';
import { GenerateInspectionReportUseCase } from '@domain/use-cases/generate-inspection-report.use-case';
import { CheckForExistingInspectionUseCase } from '@domain/use-cases/check-for-existing-inspection.use-case';
import { UpdateInspectionUseCase } from '@domain/use-cases/update-inspection.use-case';
import { DeleteInspectionUseCase } from '@domain/use-cases/delete-inspection.use-case';
import { DeleteEvidenceUseCase } from '@domain/use-cases/delete-evidence.use-case';
import { AttachSignaturesUseCase } from 'src/domain/use-cases/attach-signatures.use-case';

// Esta função cria um objeto com métodos 'execute' falsos para qualquer Use Case
const createMockUseCase = () => ({
  execute: jest.fn(),
  executePdf: jest.fn(),
  executeHtml: jest.fn(),
});

// Criamos um mock para cada Use Case
export const mockCreateInspectionUseCase = createMockUseCase();
export const mockUpdateItemUseCase = createMockUseCase();
export const mockUploadEvidenceUseCase = createMockUseCase();
export const mockFinalizeInspectionUseCase = createMockUseCase();
export const mockFindAllInspectionsUseCase = createMockUseCase();
export const mockFindByIdUseCase = createMockUseCase();
export const mockGenerateReportUseCase = createMockUseCase();
export const mockCheckForExistingUseCase = createMockUseCase();
export const mockUpdateInspectionUseCase = createMockUseCase();
export const mockDeleteInspectionUseCase = createMockUseCase();
export const mockDeleteEvidenceUseCase = createMockUseCase();
export const mockDownloadEvidenceUseCase = createMockUseCase();
export const mockAttachSignaturesUseCase = createMockUseCase();

// Criamos uma lista de providers pronta para ser usada nos nossos testes
export const allUseCasesMocks = [
  { provide: CreateInspectionUseCase, useValue: mockCreateInspectionUseCase },
  { provide: UpdateInspectionChecklistItemUseCase, useValue: mockUpdateItemUseCase },
  { provide: UploadEvidenceUseCase, useValue: mockUploadEvidenceUseCase },
  { provide: FinalizeInspectionUseCase, useValue: mockFinalizeInspectionUseCase },
  { provide: FindAllInspectionsUseCase, useValue: mockFindAllInspectionsUseCase },
  { provide: FindInspectionByIdUseCase, useValue: mockFindByIdUseCase },
  { provide: GenerateInspectionReportUseCase, useValue: mockGenerateReportUseCase },
  { provide: CheckForExistingInspectionUseCase, useValue: mockCheckForExistingUseCase },
  { provide: UpdateInspectionUseCase, useValue: mockUpdateInspectionUseCase },
  { provide: DeleteInspectionUseCase, useValue: mockDeleteInspectionUseCase },
  { provide: DeleteEvidenceUseCase, useValue: mockDeleteEvidenceUseCase },
  { provide: DownloadEvidenceUseCase, useValue: mockDownloadEvidenceUseCase },
  { provide: AttachSignaturesUseCase, useValue: mockAttachSignaturesUseCase },
];