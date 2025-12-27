import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FinalizeInspectionUseCase } from 'src/domain/use-cases/finalize-inspection.use-case';
import { FinalizeInspectionUseCaseImpl } from 'src/domain/use-cases/impl/finalize-inspection.use-case.impl';
import { InspectionRepositoryPort } from 'src/domain/repositories/inspection.repository.port';
import { Inspection } from 'src/domain/models/inspection.model';

// constantes para clareza
const STATUS_ITEM_EM_INSPECAO = 1;
const STATUS_ITEM_CONFORME = 2;
const STATUS_ITEM_NAO_CONFORME = 3;
const STATUS_ITEM_NA = 4;
const STATUS_INSPECAO_APROVADO = 2;
const STATUS_INSPECAO_REPROVADO = 3;

const mockInspectionRepository = {
  findByIdWithItems: jest.fn(),
  findByIdWithDetails: jest.fn(),
  update: jest.fn(),
};

describe('FinalizeInspectionUseCaseImpl', () => {
  let useCase: FinalizeInspectionUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: FinalizeInspectionUseCase, useClass: FinalizeInspectionUseCaseImpl },
        { provide: InspectionRepositoryPort, useValue: mockInspectionRepository },
      ],
    }).compile();
    useCase = module.get<FinalizeInspectionUseCase>(FinalizeInspectionUseCase);
    repository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
  });

  it('deve definir o status como APROVADO se houver itens CONFORME e N/A', async () => {
    // Arrange
    const inspectionId = 1;
    const mockInspection = {
      id: inspectionId,
      items: [{ statusId: STATUS_ITEM_CONFORME }, { statusId: STATUS_ITEM_NA }],
    } as Inspection;
    mockInspectionRepository.findByIdWithItems.mockResolvedValue(mockInspection);
    mockInspectionRepository.findByIdWithDetails.mockResolvedValue({ ...mockInspection, statusId: STATUS_INSPECAO_APROVADO });

    // Act
    await useCase.execute(inspectionId);

    // Assert
    expect(repository.update).toHaveBeenCalledWith(inspectionId,
      expect.objectContaining({ statusId: STATUS_INSPECAO_APROVADO })
    );
  });

  it('deve definir o status como REPROVADO se algum item estiver NÃO CONFORME', async () => {
    // Arrange
    const inspectionId = 1;
    const mockInspection = {
      id: inspectionId,
      items: [{ statusId: STATUS_ITEM_CONFORME }, { statusId: STATUS_ITEM_NAO_CONFORME }],
    } as Inspection;
    mockInspectionRepository.findByIdWithItems.mockResolvedValue(mockInspection);
    mockInspectionRepository.findByIdWithDetails.mockResolvedValue({ ...mockInspection, statusId: STATUS_INSPECAO_REPROVADO });

    // Act
    await useCase.execute(inspectionId);

    // Assert
    expect(repository.update).toHaveBeenCalledWith(inspectionId,
      expect.objectContaining({ statusId: STATUS_INSPECAO_REPROVADO })
    );
  });

  it('deve lançar BadRequestException se houver itens EM INSPEÇÃO', async () => {
    // Arrange
    const mockInspection = {
      id: 1,
      items: [{ statusId: STATUS_ITEM_EM_INSPECAO }],
    } as Inspection;
    mockInspectionRepository.findByIdWithItems.mockResolvedValue(mockInspection);

    // Act & Assert
    await expect(useCase.execute(1)).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException se não houver itens acionáveis (só N/A)', async () => {
    // Arrange
    const inspectionId = 1;
    const mockInspection = {
      id: inspectionId,
      items: [{ statusId: STATUS_ITEM_NA }, { statusId: STATUS_ITEM_NA }], // Apenas N/A
    } as Inspection;
    mockInspectionRepository.findByIdWithItems.mockResolvedValue(mockInspection);

    // Act & Assert
    await expect(useCase.execute(inspectionId)).rejects.toThrow(
      new BadRequestException('Não é possível finalizar. Pelo menos um item deve ser marcado como "CONFORME" ou "NÃO CONFORME".')
    );
  });

  it('deve lançar NotFoundException se a inspeção não for encontrada', async () => {
    mockInspectionRepository.findByIdWithItems.mockResolvedValue(null);
    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
  });
});