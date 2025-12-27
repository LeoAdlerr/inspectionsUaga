import { Test, TestingModule } from '@nestjs/testing';
import { CreateInspectionUseCase } from '../../../../../src/domain/use-cases/create-inspection.use-case';
import { CreateInspectionUseCaseImpl } from '../../../../../src/domain/use-cases/impl/create-inspection.use-case.impl';
import { InspectionRepositoryPort } from '../../../../../src/domain/repositories/inspection.repository.port';
import { MasterInspectionPointRepositoryPort } from '../../../../../src/domain/repositories/master-inspection-point.repository.port';
import { CreateInspectionDto } from '../../../../../src/api/dtos/create-inspection.dto';
import { Inspection } from '../../../../../src/domain/models/inspection.model';
import { MasterInspectionPoint } from '../../../../../src/domain/models/master-inspection-point.model';

describe('CreateInspectionUseCaseImpl', () => {
  let useCase: CreateInspectionUseCase;
  let inspectionRepository: InspectionRepositoryPort;
  let masterPointRepository: MasterInspectionPointRepositoryPort;

  // Mock dos repositórios com os métodos que vamos usar
  const mockInspectionRepository = {
    create: jest.fn(),
  };
  const mockMasterPointRepository = {
    findForModality: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInspectionUseCaseImpl,
        { provide: CreateInspectionUseCase, useClass: CreateInspectionUseCaseImpl },
        { provide: InspectionRepositoryPort, useValue: mockInspectionRepository },
        { provide: MasterInspectionPointRepositoryPort, useValue: mockMasterPointRepository },
      ],
    }).compile();

    useCase = module.get<CreateInspectionUseCase>(CreateInspectionUseCase);
    inspectionRepository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
    masterPointRepository = module.get<MasterInspectionPointRepositoryPort>(MasterInspectionPointRepositoryPort);
    jest.clearAllMocks();
  });

  it('deve criar uma inspeção com 18 itens de checklist para a modalidade Rodoviário', async () => {
    // Arrange
    const createDto: CreateInspectionDto = {
      inspectorId: 1, driverName: 'Motorista Rodoviário',
      modalityId: 1, // 1 = RODOVIARIO
      operationTypeId: 1, unitTypeId: 1,
    };
    // Simulamos o repositório a retornar 18 pontos
    const mock18Points = Array.from({ length: 18 }, (_, i) => ({ id: i + 1 } as MasterInspectionPoint));
    jest.spyOn(masterPointRepository, 'findForModality').mockResolvedValue(mock18Points);
    jest.spyOn(inspectionRepository, 'create').mockResolvedValue({} as any);

    // Act
    await useCase.execute(createDto);

    // Assert
    // Verificamos se o método correto do repositório foi chamado
    expect(masterPointRepository.findForModality).toHaveBeenCalledWith(createDto.modalityId);
    // Verificamos o argumento passado para o `create`
    const createdInspectionData = mockInspectionRepository.create.mock.calls[0][0];
    expect(createdInspectionData.items).toHaveLength(18);
  });

  it('deve criar uma inspeção com 11 itens de checklist para a modalidade Marítimo', async () => {
    // Arrange
    const createDto: CreateInspectionDto = {
        inspectorId: 1, driverName: 'Motorista Marítimo',
        modalityId: 2, // 2 = MARITIMO
        operationTypeId: 1, unitTypeId: 1,
    };
    // Simulamos o repositório a retornar 11 pontos
    const mock11Points = Array.from({ length: 11 }, (_, i) => ({ id: i + 1 } as MasterInspectionPoint));
    jest.spyOn(masterPointRepository, 'findForModality').mockResolvedValue(mock11Points);
    jest.spyOn(inspectionRepository, 'create').mockResolvedValue({} as any);

    // Act
    await useCase.execute(createDto);

    // Assert
    expect(masterPointRepository.findForModality).toHaveBeenCalledWith(createDto.modalityId);
    const createdInspectionData = mockInspectionRepository.create.mock.calls[0][0];
    expect(createdInspectionData.items).toHaveLength(11);
  });
});