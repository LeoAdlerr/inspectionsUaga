import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { Inspection } from 'src/domain/models/inspection.model';
import { allUseCasesMocks, mockCheckForExistingUseCase } from './inspection.controller.mocks';

describe('InspectionController - checkExisting', () => {
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

  it('deve chamar o use case e retornar a inspeção encontrada', async () => {
    // Arrange
    const dto: CreateInspectionDto = {
        inspectorId: 1,
        driverName: 'Motorista Teste',
        modalityId: 1,
        operationTypeId: 1,
        unitTypeId: 1,
        vehiclePlates: 'ABC-1234',
    };
    const expectedResult = { id: 123, inspectorId: 1, driverName: 'Motorista Teste' } as Inspection;
    
    mockCheckForExistingUseCase.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await controller.checkExisting(dto);

    // Assert
    expect(mockCheckForExistingUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });

  it('deve lançar NotFoundException se nenhuma inspeção for encontrada', async () => {
    // Arrange
    const dto: CreateInspectionDto = {
        inspectorId: 2,
        driverName: 'Outro Motorista',
        modalityId: 1,
        operationTypeId: 1,
        unitTypeId: 1,
        vehiclePlates: 'XYZ-5678',
    };
    mockCheckForExistingUseCase.execute.mockResolvedValue(null);

    // Act & Assert
    await expect(controller.checkExisting(dto)).rejects.toThrow(NotFoundException);
    expect(mockCheckForExistingUseCase.execute).toHaveBeenCalledWith(dto);
  });
});