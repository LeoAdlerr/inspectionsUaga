import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindInspectionByIdUseCase } from 'src/domain/use-cases/find-inspection-by-id.use-case';
import { FindInspectionByIdUseCaseImpl } from 'src/domain/use-cases/impl/find-inspection-by-id.use-case.impl';
import { InspectionRepositoryPort } from 'src/domain/repositories/inspection.repository.port';
import { Inspection } from 'src/domain/models/inspection.model';
import { ItemEvidence } from 'src/domain/models/item-evidence.model';
import { InspectionChecklistItem } from 'src/domain/models/inspection-checklist-item.model';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';

const mockInspectionRepository = {
  findById: jest.fn(),
};

describe('FindInspectionByIdUseCase', () => {
  let useCase: FindInspectionByIdUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FindInspectionByIdUseCase,
          useClass: FindInspectionByIdUseCaseImpl,
        },
        {
          provide: InspectionRepositoryPort,
          useValue: mockInspectionRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindInspectionByIdUseCase>(FindInspectionByIdUseCase);
    repository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deve retornar uma inspeção completa', async () => {
    // Arrange
    const inspectionId = 1;
    
    // O objeto mock agora reflete a nova estrutura do Inspection model
    const mockRichInspection = new Inspection();
    Object.assign(mockRichInspection, {
      id: inspectionId,
      inspectorId: 10,
      statusId: 1,
      driverName: 'Motorista Mock',
      modalityId: 1,
      operationTypeId: 1,
      unitTypeId: 1,
      startDatetime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      inspector: {
        id: 10,
        fullName: 'Leonardo Testador',
        username: 'ltester',
        isActive: true,
        roles: [{ id: 3, name: RoleName.INSPECTOR }] as Role[],
      } as User,
      items: [
        {
          id: 1,
          inspectionId: inspectionId,
          masterPointId: 1,
          statusId: 2,
          evidences: [{ id: 101 } as ItemEvidence],
        } as InspectionChecklistItem,
      ],
    });
    
    mockInspectionRepository.findById.mockResolvedValue(mockRichInspection);

    // Act
    const result = await useCase.execute(inspectionId);

    // Assert
    expect(result).toEqual(mockRichInspection);
    expect(repository.findById).toHaveBeenCalledWith(inspectionId);
    expect(result.inspector!.fullName).toEqual('Leonardo Testador');
  });

  it('deve lançar um NotFoundException se o repositório retornar nulo', async () => {
    // Arrange
    const inspectionId = 999;
    mockInspectionRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(inspectionId)).rejects.toThrow(NotFoundException);
  });
});