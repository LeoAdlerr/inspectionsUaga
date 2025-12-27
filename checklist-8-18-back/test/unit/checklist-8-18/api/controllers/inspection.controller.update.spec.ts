import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { UpdateInspectionDto } from 'src/api/dtos/update-inspection.dto';
import { Inspection } from 'src/domain/models/inspection.model';
import { allUseCasesMocks, mockUpdateInspectionUseCase } from './inspection.controller.mocks';

describe('InspectionController - update', () => {
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

  it('deve chamar o UpdateInspectionUseCase com o ID e DTO corretos e retornar a inspeção atualizada', async () => {
    // Arrange
    const inspectionId = 1;
    const updateDto: UpdateInspectionDto = { driverName: 'Novo Nome do Motorista' };
    const expectedResult = { id: inspectionId, ...updateDto } as Inspection;
    
    // Usamos o mock importado
    mockUpdateInspectionUseCase.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await controller.update(inspectionId, updateDto);

    // Assert
    expect(mockUpdateInspectionUseCase.execute).toHaveBeenCalledWith(inspectionId, updateDto);
    expect(result).toEqual(expectedResult);
  });
});