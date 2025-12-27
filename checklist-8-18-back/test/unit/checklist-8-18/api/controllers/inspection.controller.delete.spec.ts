import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { allUseCasesMocks, mockDeleteInspectionUseCase } from './inspection.controller.mocks';

describe('InspectionController - delete', () => {
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

  it('deve chamar o DeleteInspectionUseCase com o ID correto e retornar uma mensagem de sucesso', async () => {
    // Arrange
    const inspectionId = 1;
    // Usamos o mock importado
    mockDeleteInspectionUseCase.execute.mockResolvedValue(undefined);

    // Act
    const result = await controller.delete(inspectionId);

    // Assert
    expect(mockDeleteInspectionUseCase.execute).toHaveBeenCalledWith(inspectionId);
    expect(result).toEqual({ message: `Inspeção com ID ${inspectionId} apagada com sucesso.` });
  });
});