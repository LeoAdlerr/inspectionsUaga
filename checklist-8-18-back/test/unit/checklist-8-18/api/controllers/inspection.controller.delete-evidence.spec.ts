import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { DeleteEvidenceDto } from 'src/api/dtos/delete-evidence.dto';
import { allUseCasesMocks, mockDeleteEvidenceUseCase } from './inspection.controller.mocks';

describe('InspectionController - deleteEvidence', () => {
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

  it('deve chamar o DeleteEvidenceUseCase com os parâmetros corretos e retornar uma mensagem de sucesso', async () => {
    // Arrange
    const inspectionId = 1;
    const pointNumber = 5;
    const dto: DeleteEvidenceDto = { fileName: 'evidence-to-delete.png' };
    // Usamos o mock importado
    mockDeleteEvidenceUseCase.execute.mockResolvedValue(undefined);

    // Act
    const result = await controller.deleteEvidence(inspectionId, pointNumber, dto);

    // Assert
    expect(mockDeleteEvidenceUseCase.execute).toHaveBeenCalledWith(
      inspectionId,
      pointNumber,
      dto.fileName,
    );
    expect(result).toEqual({ message: `Evidência "${dto.fileName}" apagada com sucesso.` });
  });
});