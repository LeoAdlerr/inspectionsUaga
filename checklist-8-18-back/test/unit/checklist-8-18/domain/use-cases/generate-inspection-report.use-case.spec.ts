import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GenerateInspectionReportUseCase } from 'src/domain/use-cases/generate-inspection-report.use-case';
import { GenerateInspectionReportUseCaseImpl } from 'src/domain/use-cases/impl/generate-inspection-report.use-case.impl';
import { FindInspectionByIdUseCase } from 'src/domain/use-cases/find-inspection-by-id.use-case';
import { PdfService } from 'src/infra/pdf/pdf.service';
import { Inspection } from 'src/domain/models/inspection.model';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';
import { InspectionChecklistItem } from 'src/domain/models/inspection-checklist-item.model';

const mockPdfService = {
  generatePdfFromHtml: jest.fn(),
};
const mockFindByIdUseCase = {
  execute: jest.fn(),
};

describe('GenerateInspectionReportUseCase', () => {
  let useCase: GenerateInspectionReportUseCase;
  let findByIdUseCase: FindInspectionByIdUseCase;
  let pdfService: PdfService; // Variável declarada corretamente

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GenerateInspectionReportUseCase,
          useClass: GenerateInspectionReportUseCaseImpl,
        },
        { provide: FindInspectionByIdUseCase, useValue: mockFindByIdUseCase },
        { provide: PdfService, useValue: mockPdfService },
      ],
    }).compile();

    useCase = module.get<GenerateInspectionReportUseCase>(GenerateInspectionReportUseCase);
    findByIdUseCase = module.get<FindInspectionByIdUseCase>(FindInspectionByIdUseCase);
    pdfService = module.get<PdfService>(PdfService); // ✅ CORREÇÃO: Inicializamos a variável
    jest.clearAllMocks();
  });

  // ✅ CORREÇÃO: Mocks atualizados para a nova estrutura
  const mockInspection = new Inspection();
  Object.assign(mockInspection, {
    id: 1,
    inspectorId: 10,
    driverName: 'Motorista de Teste',
    statusId: 2, // APROVADO
    startDatetime: new Date(),
    modalityId: 1, operationTypeId: 1, unitTypeId: 1, createdAt: new Date(), updatedAt: new Date(),
    inspector: {
      id: 10,
      fullName: 'Inspetor de Teste',
    } as User,
    items: [{ masterPointId: 1, statusId: 2 }] as InspectionChecklistItem[], // Item concluído
  });

  const mockIncompleteInspection = new Inspection();
  Object.assign(mockIncompleteInspection, {
    id: 2,
    inspectorId: 11,
    driverName: 'Motorista Incompleto',
    statusId: 1, // EM_INSPECAO
    startDatetime: new Date(),
    modalityId: 1, operationTypeId: 1, unitTypeId: 1, createdAt: new Date(), updatedAt: new Date(),
    inspector: { id: 11, fullName: 'Inspetor Incompleto' } as User,
    items: [
      { masterPointId: 1, statusId: 2 }, // Concluído
      { masterPointId: 2, statusId: 1 }, // Pendente
    ] as InspectionChecklistItem[],
  });



  describe('executePdf', () => {
    it('deve chamar o serviço de PDF e retornar um buffer em caso de sucesso', async () => {
      // Arrange
      const mockPdfBuffer = Buffer.from('conteudo-do-pdf');
      mockFindByIdUseCase.execute.mockResolvedValue(mockInspection);
      mockPdfService.generatePdfFromHtml.mockResolvedValue(mockPdfBuffer);
      const result = await useCase.executePdf(mockInspection.id);

      // Assert
      expect(findByIdUseCase.execute).toHaveBeenCalledWith(mockInspection.id);
      // Usamos a variável 'pdfService' que foi declarada e inicializada
      expect(pdfService.generatePdfFromHtml).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockPdfBuffer);
    });

    it('deve lançar um BadRequestException se a inspeção tiver itens pendentes', async () => {
      // Arrange
      mockFindByIdUseCase.execute.mockResolvedValue(mockIncompleteInspection);

      // Act & Assert
      await expect(useCase.executePdf(mockIncompleteInspection.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('executeHtml', () => {
    it('deve retornar uma string HTML populada em caso de sucesso', async () => {
      // Arrange
      mockFindByIdUseCase.execute.mockResolvedValue(mockInspection);
      const result = await useCase.executeHtml(mockInspection.id);

      // Assert
      expect(findByIdUseCase.execute).toHaveBeenCalledWith(mockInspection.id);
      // Usamos o operador '!' para garantir ao TypeScript que 'inspector' não é nulo
      expect(result).toContain(mockInspection.inspector!.fullName);
    });
  });
});