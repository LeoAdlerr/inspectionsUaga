import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { allUseCasesMocks, mockDownloadEvidenceUseCase } from './inspection.controller.mocks';

describe('InspectionController - downloadEvidence', () => {
  let controller: InspectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionController],
      // Usamos a lista completa de mocks para satisfazer todas as dependências
      providers: [...allUseCasesMocks],
    }).compile();

    controller = module.get<InspectionController>(InspectionController);
    jest.clearAllMocks(); // Limpa os mocks antes de cada teste
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar o use case, definir os headers corretos e retornar um StreamableFile', async () => {
    // Arrange
    const inspectionId = 1;
    const pointNumber = 5;
    const fileName = 'evidence.jpg';
    
    const mockUseCaseResult = {
      buffer: Buffer.from('fake-image-data'),
      mimeType: 'image/jpeg',
      fileName: 'evidence.jpg',
    };
    
    const mockResponse = {
      setHeader: jest.fn(),
    } as unknown as Response;

    // Usamos o mock importado diretamente, que é mais limpo e explícito
    mockDownloadEvidenceUseCase.execute.mockResolvedValue(mockUseCaseResult);

    // Act
    const result = await controller.downloadEvidence(inspectionId, pointNumber, fileName, mockResponse);

    // Assert
    expect(mockDownloadEvidenceUseCase.execute).toHaveBeenCalledWith(inspectionId, pointNumber, fileName);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', mockUseCaseResult.mimeType);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      `attachment; filename="${mockUseCaseResult.fileName}"`,
    );
    expect(result).toBeInstanceOf(StreamableFile);
  });
});