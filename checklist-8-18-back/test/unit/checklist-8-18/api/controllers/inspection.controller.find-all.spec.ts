import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { Inspection } from 'src/domain/models/inspection.model';
import { allUseCasesMocks, mockFindAllInspectionsUseCase } from './inspection.controller.mocks';

describe('InspectionController - findAll', () => {
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

  it('deve chamar o FindAllInspectionsUseCase e retornar uma lista de inspeções', async () => {
    // Arrange
    // Criamos um array de mocks válidos e completos
    const mockInspection1 = new Inspection();
    mockInspection1.id = 1;
    mockInspection1.inspectorId = 10;
    mockInspection1.driverName = 'Motorista 1';
    
    const mockInspection2 = new Inspection();
    mockInspection2.id = 2;
    mockInspection2.inspectorId = 11;
    mockInspection2.driverName = 'Motorista 2';
    
    const expectedResult: Inspection[] = [mockInspection1, mockInspection2];
    
    mockFindAllInspectionsUseCase.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await controller.findAll();

    // Assert
    expect(mockFindAllInspectionsUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(result.length).toBe(2);
  });

  it('deve retornar uma lista vazia se não houver inspeções', async () => {
    // Arrange
    const expectedResult: Inspection[] = [];
    mockFindAllInspectionsUseCase.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await controller.findAll();

    // Assert
    expect(mockFindAllInspectionsUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});