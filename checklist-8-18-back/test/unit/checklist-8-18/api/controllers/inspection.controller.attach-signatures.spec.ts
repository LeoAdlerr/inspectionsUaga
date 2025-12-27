import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { AttachSignaturesDto } from 'src/api/dtos/attach-signatures.dto';
import { Inspection } from 'src/domain/models/inspection.model';
import { allUseCasesMocks, mockAttachSignaturesUseCase } from './inspection.controller.mocks';

describe('InspectionController - attachSignatures', () => {
  let controller: InspectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionController],
      providers: [...allUseCasesMocks],
    }).compile();

    controller = module.get<InspectionController>(InspectionController);
    jest.clearAllMocks();
  });

  it('deve chamar o AttachSignaturesUseCase com os parâmetros corretos', async () => {
    // Arrange
    const inspectionId = 123;
    const mockReq = { user: { userId: 1 } };
    const mockDto: AttachSignaturesDto = { useProfileSignature: false };
    const mockFiles = {
      driverSignature: [{ originalname: 'driver.png' } as Express.Multer.File],
    };
    const expectedResult = { id: inspectionId } as Inspection;

    mockAttachSignaturesUseCase.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await controller.attachSignatures(
      inspectionId,
      mockReq,
      mockDto,
      mockFiles,
    );

    // Assert
    expect(mockAttachSignaturesUseCase.execute).toHaveBeenCalledWith(
      mockReq.user.userId,
      inspectionId,
      mockDto,
      mockFiles,
    );
    expect(result).toEqual(expectedResult);
  });
});