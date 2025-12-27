import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AttachSignaturesUseCaseImpl } from 'src/domain/use-cases/impl/attach-signatures.use-case.impl';
import { InspectionRepositoryPort } from 'src/domain/repositories/inspection.repository.port';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { Inspection } from 'src/domain/models/inspection.model';
import { User } from 'src/domain/models/user.model';
import { Role, RoleName } from 'src/domain/models/role.model';


type UploadedFile = Express.Multer.File;

describe('AttachSignaturesUseCaseImpl', () => {
  let useCase: AttachSignaturesUseCaseImpl;
  let inspectionRepository: InspectionRepositoryPort;
  let userRepository: UserRepositoryPort;
  let fileSystemService: FileSystemPort;

  const mockInspectionRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {
    findById: jest.fn(),
  };

  const mockFileSystem = {
    saveFile: jest.fn(),
    copyFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachSignaturesUseCaseImpl,
        { provide: InspectionRepositoryPort, useValue: mockInspectionRepository },
        { provide: UserRepositoryPort, useValue: mockUserRepository },
        { provide: FileSystemPort, useValue: mockFileSystem },
      ],
    }).compile();

    useCase = module.get<AttachSignaturesUseCaseImpl>(AttachSignaturesUseCaseImpl);
    inspectionRepository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
    userRepository = module.get<UserRepositoryPort>(UserRepositoryPort);
    fileSystemService = module.get<FileSystemPort>(FileSystemPort);

    jest.clearAllMocks();
  });

  // 🔧 Helper: cria arquivo simulado
  const mockFile = (name: string) => ({
    originalname: name,
    buffer: Buffer.from(name),
  }) as UploadedFile;

  // 🔧 Helper: cria usuário completo
  const createMockUserEntity = (options: { withSignature: boolean }) => {
    const user = new UserEntity();
    user.id = 1;
    user.signaturePath = options.withSignature ? 'path/to/profile_sig.png' : null;
    user.roles = [];
    return user;
  };

  // 🔧 Helper: cria inspeção de domínio válida
  const createMockInspection = (): Inspection => {
    const inspector = new User();
    inspector.id = 1;
    inspector.fullName = 'Inspector Teste';
    inspector.roles = [
      Object.assign(new Role(), { id: 1, name: RoleName.INSPECTOR }),
    ];

    const inspection = new Inspection();
    inspection.id = 123;
    inspection.inspector = inspector;
    inspection.items = [];
    return inspection;
  };

  it('deve salvar as assinaturas do inspetor e do motorista e atualizar a inspeção', async () => {
    // Arrange
    const userId = 1;
    const inspectionId = 123;
    const files = {
      inspectorSignature: [mockFile('inspector.png')],
      driverSignature: [mockFile('driver.png')],
    };

    jest.spyOn(inspectionRepository, 'findById').mockResolvedValue(createMockInspection());
    jest.spyOn(fileSystemService, 'saveFile')
      .mockResolvedValueOnce('path/inspector.png')
      .mockResolvedValueOnce('path/driver.png');
    jest.spyOn(inspectionRepository, 'update').mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId, inspectionId, {}, files);

    // Assert
    expect(fileSystemService.saveFile).toHaveBeenCalledTimes(2);
    expect(inspectionRepository.update).toHaveBeenCalledWith(inspectionId, expect.any(Object));
  });

  it('deve usar a assinatura do perfil do inspetor quando useProfileSignature for true', async () => {
    const userId = 1;
    const inspectionId = 123;
    const files = { driverSignature: [mockFile('driver.png')] };
    const userWithSignature = createMockUserEntity({ withSignature: true });

    jest.spyOn(inspectionRepository, 'findById').mockResolvedValue(createMockInspection());
    jest.spyOn(userRepository, 'findById').mockResolvedValue(userWithSignature);
    jest.spyOn(fileSystemService, 'copyFile').mockResolvedValue('path/inspections/123/copied_sig.png');
    jest.spyOn(fileSystemService, 'saveFile').mockResolvedValue('path/inspections/123/driver.png');

    await useCase.execute(userId, inspectionId, { useProfileSignature: true }, files);

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(fileSystemService.copyFile).toHaveBeenCalled();
    expect(inspectionRepository.update).toHaveBeenCalledWith(inspectionId, expect.any(Object));
  });

  it('deve lançar BadRequestException se useProfileSignature for true mas o usuário não tiver assinatura', async () => {
    const userWithoutSignature = createMockUserEntity({ withSignature: false });

    jest.spyOn(inspectionRepository, 'findById').mockResolvedValue(createMockInspection());
    jest.spyOn(userRepository, 'findById').mockResolvedValue(userWithoutSignature);

    await expect(
      useCase.execute(1, 123, { useProfileSignature: true }, {})
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar NotFoundException se a inspeção não for encontrada', async () => {
    jest.spyOn(inspectionRepository, 'findById').mockResolvedValue(null);

    await expect(useCase.execute(1, 999, {}, {})).rejects.toThrow(NotFoundException);
  });
});
