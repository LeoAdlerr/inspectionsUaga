import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from 'src/api/controllers/roles.controller';
import { FindLookupsByTypeUseCase } from 'src/domain/use-cases/find-lookups-by-type.use-case';
import { Role } from 'src/domain/models/role.model';
import { RoleName } from 'src/domain/models/role.model';

describe('RolesController', () => {
  let controller: RolesController;
  let findLookupsByTypeUseCase: FindLookupsByTypeUseCase;

  const mockFindLookupsByTypeUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: FindLookupsByTypeUseCase,
          useValue: mockFindLookupsByTypeUseCase,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    findLookupsByTypeUseCase = module.get<FindLookupsByTypeUseCase>(FindLookupsByTypeUseCase);
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve chamar o FindLookupsByTypeUseCase com o tipo "roles" e retornar a lista de roles', async () => {
      // Arrange
      const mockRoles: Role[] = [
        { id: 1, name: RoleName.ADMIN },
        { id: 3, name: RoleName.INSPECTOR },
      ];
      mockFindLookupsByTypeUseCase.execute.mockResolvedValue(mockRoles);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(findLookupsByTypeUseCase.execute).toHaveBeenCalledWith('roles');
      expect(result).toEqual(mockRoles);
    });
  });
});