import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { allUseCasesMocks, mockGenerateReportUseCase } from './inspection.controller.mocks';

describe('InspectionController - generateReportPdf', () => {
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

  it('deve chamar o use case, definir os headers corretos e retornar um StreamableFile', async () => {
    // Arrange
    const inspectionId = 1;
    const pdfBuffer = Buffer.from('fake-pdf-content');
    const mockResponse = {
      setHeader: jest.fn(),
    } as unknown as Response;
    mockGenerateReportUseCase.executePdf.mockResolvedValue(pdfBuffer);

    // Act
    const result = await controller.generateReportPdf(inspectionId, mockResponse);

    // Assert
    expect(mockGenerateReportUseCase.executePdf).toHaveBeenCalledWith(inspectionId);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      `attachment; filename="inspecao-${inspectionId}.pdf"`,
    );
    expect(result).toBeInstanceOf(StreamableFile);
    expect(result.getStream().read()).toEqual(pdfBuffer);
  });
});