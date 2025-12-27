import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { Inspection } from 'src/domain/models/inspection.model';
import { allUseCasesMocks, mockFinalizeInspectionUseCase } from './inspection.controller.mocks';

describe('InspectionController - finalize', () => {
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

  it('deve chamar o FinalizeInspectionUseCase com o ID correto e retornar a inspeção finalizada', async () => {
    // Arrange
    const inspectionId = 1;
    const expectedResult = { id: inspectionId, statusId: 2 } as Inspection; // Simula um status de finalizado
    // Usamos o mock importado
    mockFinalizeInspectionUseCase.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await controller.finalize(inspectionId);

    // Assert
    expect(mockFinalizeInspectionUseCase.execute).toHaveBeenCalledWith(inspectionId);
    expect(result).toEqual(expectedResult);
  });
});