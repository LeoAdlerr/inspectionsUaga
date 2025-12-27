import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { Inspection } from 'src/domain/models/inspection.model';
import { allUseCasesMocks, mockCreateInspectionUseCase } from './inspection.controller.mocks';

describe('InspectionController - create', () => {
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

  it('deve chamar o CreateInspectionUseCase e retornar a nova inspeção', async () => {
    // Arrange
    // Criamos um DTO válido e completo
    const createDto: CreateInspectionDto = {
      inspectorId: 1,
      driverName: 'Novo Motorista',
      modalityId: 1,
      operationTypeId: 1,
      unitTypeId: 1,
    };

    const expectedResult = { 
        id: 1, 
        inspectorId: 1, 
        driverName: 'Novo Motorista' 
    } as Inspection;
    
    mockCreateInspectionUseCase.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await controller.create(createDto);

    // Assert
    expect(mockCreateInspectionUseCase.execute).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(expectedResult);
  });
});