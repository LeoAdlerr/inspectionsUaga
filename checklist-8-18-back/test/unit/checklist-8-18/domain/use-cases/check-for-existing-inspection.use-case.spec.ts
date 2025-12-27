import { Test, TestingModule } from '@nestjs/testing';
import { CheckForExistingInspectionUseCase } from 'src/domain/use-cases/check-for-existing-inspection.use-case';
import { CheckForExistingInspectionUseCaseImpl } from 'src/domain/use-cases/impl/check-for-existing-inspection.use-case.impl';
import { InspectionRepositoryPort } from 'src/domain/repositories/inspection.repository.port';
import { Inspection } from 'src/domain/models/inspection.model';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';

const mockInspectionRepository = {
  findExistingInspection: jest.fn(),
};

describe('CheckForExistingInspectionUseCase', () => {
  let useCase: CheckForExistingInspectionUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CheckForExistingInspectionUseCase,
          useClass: CheckForExistingInspectionUseCaseImpl,
        },
        {
          provide: InspectionRepositoryPort,
          useValue: mockInspectionRepository,
        },
      ],
    }).compile();

    useCase = module.get<CheckForExistingInspectionUseCase>(CheckForExistingInspectionUseCase);
    repository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
    jest.clearAllMocks();
  });

  it('deve retornar uma inspeção se uma duplicata for encontrada', async () => {
    // Arrange
    //  Criamos um DTO completo e válido
    const dto: CreateInspectionDto = {
        inspectorId: 1,
        driverName: 'Motorista Teste',
        modalityId: 1,
        operationTypeId: 1,
        unitTypeId: 1,
    };
    // O mock de Inspeção reflete a estrutura
    const mockExistingInspection = { id: 1, inspectorId: 1 } as Inspection;
    
    mockInspectionRepository.findExistingInspection.mockResolvedValue(mockExistingInspection);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(repository.findExistingInspection).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockExistingInspection);
  });

  it('deve retornar nulo se nenhuma duplicata for encontrada', async () => {
    // Arrange
    const dto: CreateInspectionDto = {
        inspectorId: 1,
        driverName: 'Motorista Teste',
        modalityId: 1,
        operationTypeId: 1,
        unitTypeId: 1,
    };
    mockInspectionRepository.findExistingInspection.mockResolvedValue(null);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(repository.findExistingInspection).toHaveBeenCalledWith(dto);
    expect(result).toBeNull();
  });

  it('deve repassar um erro se o repositório falhar', async () => {
    // Arrange
    const dto: CreateInspectionDto = {
        inspectorId: 1,
        driverName: 'Motorista Teste',
        modalityId: 1,
        operationTypeId: 1,
        unitTypeId: 1,
    };
    const mockError = new Error('Erro de banco de dados');
    mockInspectionRepository.findExistingInspection.mockRejectedValue(mockError);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(mockError);
  });
});