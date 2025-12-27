import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { Inspection } from 'src/domain/models/inspection.model';
import { allUseCasesMocks, mockFindByIdUseCase } from './inspection.controller.mocks';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';

describe('InspectionController - findById', () => {
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

  it('deve chamar o FindInspectionByIdUseCase e retornar a inspeção correta', async () => {
    // Arrange
    const inspectionId = 1;
    // Criamos um mock completo e válido para o modelo Inspection
    const expectedResult = new Inspection();
    Object.assign(expectedResult, {
        id: inspectionId,
        inspectorId: 10,
        driverName: 'Motorista Teste',
        statusId: 1,
        modalityId: 1,
        operationTypeId: 1,
        unitTypeId: 1,
        startDatetime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        inspector: {
            id: 10,
            fullName: 'Inspetor Teste',
            roles: [{ id: 3, name: RoleName.INSPECTOR }] as Role[],
        } as User,
        items: [],
    });
    
    mockFindByIdUseCase.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await controller.findById(inspectionId);

    // Assert
    expect(mockFindByIdUseCase.execute).toHaveBeenCalledWith(inspectionId);
    expect(result).toEqual(expectedResult);
  });

  it('deve lançar NotFoundException se o caso de uso não encontrar a inspeção', async () => {
    // Arrange
    const inspectionId = 999;
    mockFindByIdUseCase.execute.mockRejectedValue(new NotFoundException('Inspeção não encontrada.'));

    // Act & Assert
    await expect(controller.findById(inspectionId)).rejects.toThrow(NotFoundException);
    expect(mockFindByIdUseCase.execute).toHaveBeenCalledWith(inspectionId);
  });
});