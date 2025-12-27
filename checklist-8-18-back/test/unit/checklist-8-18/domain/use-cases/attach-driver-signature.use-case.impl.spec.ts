import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AttachDriverSignatureUseCaseImpl } from 'src/domain/use-cases/impl/attach-driver-signature.use-case.impl';
import { InspectionRepositoryPort } from 'src/domain/repositories/inspection.repository.port';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import { AttachDriverSignatureDto } from 'src/api/dtos/attach-driver-signature.dto';
import { Inspection } from 'src/domain/models/inspection.model';

const mockInspectionRepository = { findById: jest.fn(), update: jest.fn() };
const mockFileSystemService = { saveFile: jest.fn(), deleteFileIfExists: jest.fn() };

describe('AttachDriverSignatureUseCaseImpl', () => {
  let useCase: AttachDriverSignatureUseCaseImpl;
  let inspectionRepository: InspectionRepositoryPort;
  let fileSystemService: FileSystemPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachDriverSignatureUseCaseImpl,
        { provide: InspectionRepositoryPort, useValue: mockInspectionRepository },
        { provide: FileSystemPort, useValue: mockFileSystemService },
      ],
    }).compile();
    useCase = module.get<AttachDriverSignatureUseCaseImpl>(AttachDriverSignatureUseCaseImpl);
    inspectionRepository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
    fileSystemService = module.get<FileSystemPort>(FileSystemPort);
    jest.clearAllMocks();
  });

  const inspectionId = 123;
  const mockInspection = new Inspection();
  Object.assign(mockInspection, { id: inspectionId, driverSignaturePath: null });

  const validBase64Dto: AttachDriverSignatureDto = {
    driverSignature: 'data:image/png;base64,fake-image-data-string',
  };

  it('deve salvar a assinatura, atualizar a inspeção e retorná-la', async () => {
    // Arrange
    const expectedPath = 'uploads/inspections/123/driver_signature.png';
    jest.spyOn(inspectionRepository, 'findById').mockResolvedValue(mockInspection);
    jest.spyOn(fileSystemService, 'saveFile').mockResolvedValue(expectedPath);
    jest.spyOn(inspectionRepository, 'update').mockResolvedValue(undefined);
    // Garantir que a busca final também retorne a inspeção
    jest.spyOn(inspectionRepository, 'findById').mockResolvedValue(mockInspection); 

    // Act
    await useCase.execute(inspectionId, validBase64Dto);

    // Assert
    expect(inspectionRepository.findById).toHaveBeenCalledWith(inspectionId);
    expect(fileSystemService.saveFile).toHaveBeenCalledWith(
      expect.stringContaining(inspectionId.toString()),
      expect.stringContaining('.png'),
      expect.any(Buffer),
    );
    expect(inspectionRepository.update).toHaveBeenCalledWith(inspectionId, {
      driverSignaturePath: expectedPath,
    });
  });

  it('deve apagar a assinatura antiga antes de salvar a nova', async () => {
    // Arrange
    const oldPath = 'uploads/inspections/123/old_sig.png';
    const inspectionWithOldSig = new Inspection();
    Object.assign(inspectionWithOldSig, { id: inspectionId, driverSignaturePath: oldPath });

    jest.spyOn(inspectionRepository, 'findById').mockResolvedValue(inspectionWithOldSig);
    jest.spyOn(fileSystemService, 'deleteFileIfExists').mockResolvedValue(undefined);
    jest.spyOn(fileSystemService, 'saveFile').mockResolvedValue('new/path.png');
    // Garantir que a busca final também retorne a inspeção
    jest.spyOn(inspectionRepository, 'findById').mockResolvedValue(inspectionWithOldSig);

    // Act
    await useCase.execute(inspectionId, validBase64Dto);

    // Assert
    expect(fileSystemService.deleteFileIfExists).toHaveBeenCalledWith(oldPath);
  });

  it('deve lançar NotFoundException se a inspeção não for encontrada', async () => {
    jest.spyOn(inspectionRepository, 'findById').mockResolvedValue(null);
    await expect(useCase.execute(999, validBase64Dto)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException se a string base64 for inválida', async () => {
    const invalidDto: AttachDriverSignatureDto = { driverSignature: 'string-invalida' };
    jest.spyOn(inspectionRepository, 'findById').mockResolvedValue(mockInspection);
    await expect(useCase.execute(inspectionId, invalidDto)).rejects.toThrow(BadRequestException);
  });
});