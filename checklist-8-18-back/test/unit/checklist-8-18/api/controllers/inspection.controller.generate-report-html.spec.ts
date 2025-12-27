import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { allUseCasesMocks, mockGenerateReportUseCase } from './inspection.controller.mocks';

describe('InspectionController - generateReportHtml', () => {
  let controller: InspectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionController],
      providers: [...allUseCasesMocks],
    }).compile();

    controller = module.get<InspectionController>(InspectionController);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar o use case e retornar a string HTML do relatório', async () => {
    // Arrange
    const inspectionId = 1;
    const expectedHtml = '<html><body><h1>Relatório de Inspeção</h1></body></html>';
    mockGenerateReportUseCase.executeHtml.mockResolvedValue(expectedHtml);

    // Act
    const result = await controller.generateReportHtml(inspectionId);

    // Assert
    expect(mockGenerateReportUseCase.executeHtml).toHaveBeenCalledWith(inspectionId);
    expect(result).toBe(expectedHtml);
  });
});