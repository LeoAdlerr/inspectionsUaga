import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { UpdateInspectionChecklistItemDto } from 'src/api/dtos/update-inspection-checklist-item.dto';
import { InspectionChecklistItem } from 'src/domain/models/inspection-checklist-item.model';
import { allUseCasesMocks, mockUpdateItemUseCase } from './inspection.controller.mocks';

describe('InspectionController - updateItem', () => {
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

  it('deve chamar o UpdateInspectionChecklistItemUseCase com os parâmetros corretos', async () => {
    // Arrange
    const inspectionId = 1;
    const pointNumber = 5;
    const updateDto: UpdateInspectionChecklistItemDto = { statusId: 2, observations: 'Tudo OK.' };
    const expectedResult = { id: 1, ...updateDto } as InspectionChecklistItem;

    // Usamos o mock importado
    mockUpdateItemUseCase.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await controller.updateItem(inspectionId, pointNumber, updateDto);

    // Assert
    expect(mockUpdateItemUseCase.execute).toHaveBeenCalledWith(inspectionId, pointNumber, updateDto);
    expect(result).toEqual(expectedResult);
  });
});