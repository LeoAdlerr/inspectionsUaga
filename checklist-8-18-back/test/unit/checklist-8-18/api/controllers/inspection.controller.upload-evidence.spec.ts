import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { ItemEvidence } from 'src/domain/models/item-evidence.model';
import { Express } from 'express';
import { allUseCasesMocks, mockUploadEvidenceUseCase } from './inspection.controller.mocks';

// Define o tipo Multer.File para o mock
type MockMulterFile = Express.Multer.File;

describe('InspectionController - uploadEvidence', () => {
  let controller: InspectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionController],
      // Usamos a lista completa de mocks
      providers: [...allUseCasesMocks],
    }).compile();

    controller = module.get<InspectionController>(InspectionController);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar o UploadEvidenceUseCase quando um ficheiro válido é enviado', async () => {
    // Arrange
    const inspectionId = 1;
    const pointNumber = 5;
    const mockFile: MockMulterFile = {
      fieldname: 'file',
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test data'),
      size: 12345,
    } as MockMulterFile;

    const expectedResult = { id: 1, fileName: 'test.jpg' } as ItemEvidence;
    // Usamos o mock importado
    mockUploadEvidenceUseCase.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await controller.uploadEvidence(inspectionId, pointNumber, mockFile);

    // Assert
    expect(mockUploadEvidenceUseCase.execute).toHaveBeenCalledWith(inspectionId, pointNumber, mockFile);
    expect(result).toEqual(expectedResult);
  });

  it('deve lançar uma HttpException se nenhum ficheiro for enviado', async () => {
    // Arrange
    const inspectionId = 1;
    const pointNumber = 5;
    const undefinedFile = undefined as any;

    // Act & Assert
    await expect(
      controller.uploadEvidence(inspectionId, pointNumber, undefinedFile)
    ).rejects.toThrow(
      new HttpException(
        'Arquivo não enviado ou o tipo não é suportado (apenas imagens).',
        HttpStatus.BAD_REQUEST,
      ),
    );

    expect(mockUploadEvidenceUseCase.execute).not.toHaveBeenCalled();
  });
});