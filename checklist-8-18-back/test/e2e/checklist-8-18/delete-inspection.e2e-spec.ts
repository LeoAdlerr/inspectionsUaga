import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { setupE2eTest } from '../test-setup.helper';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [DELETE /inspections/:id]', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let inspectionRepo: Repository<InspectionEntity>;
  let userRepo: Repository<UserEntity>;
  let clearDatabase: () => Promise<void>;
  let authToken: string;
  let testInspector: UserEntity;

  beforeAll(async () => {
    ({ app, dataSource, clearDatabase } = await setupE2eTest());
    inspectionRepo = dataSource.getRepository(InspectionEntity);
    userRepo = dataSource.getRepository(UserEntity);
  });

  beforeEach(async () => {
    await clearDatabase();
    // Criamos um usuário e obtemos o token
    const passwordHash = await bcrypt.hash('senha123', 10);
    testInspector = await userRepo.save(userRepo.create({
        fullName: 'E2E Delete Inspector',
        username: 'e2edeleteinspector',
        passwordHash,
        isActive: true,
    }));

    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginIdentifier: 'e2edeleteinspector', password: 'senha123' });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await clearDatabase();
    await app.close();
  });

  const createInspectionViaApi = async () => {
    const createDto: CreateInspectionDto = {
        inspectorId: testInspector.id,
        driverName: 'Driver to Delete',
        modalityId: 1, operationTypeId: 1, unitTypeId: 1,
    };
    const response = await request(app.getHttpServer())
        .post('/inspections')
        .set('Authorization', `Bearer ${authToken}`) // Usa o token
        .send(createDto)
        .expect(201);
    return response.body.id;
  };

  it('deve apagar uma inspeção com sucesso', async () => {
    // Arrange
    const inspectionId = await createInspectionViaApi();
    
    // Act
    await request(app.getHttpServer())
      .delete(`/inspections/${inspectionId}`)
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .expect(200);

    // Assert
    const deletedInspection = await inspectionRepo.findOneBy({ id: inspectionId });
    expect(deletedInspection).toBeNull();
  });

  it('deve retornar 403 (Forbidden) ao tentar apagar uma inspeção finalizada', async () => {
    // Arrange
    const inspectionId = await createInspectionViaApi();
    await inspectionRepo.update(inspectionId, { statusId: 2 }); // Finaliza a inspeção

    // Act & Assert
    await request(app.getHttpServer())
      .delete(`/inspections/${inspectionId}`)
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .expect(403);
  });

  it('deve retornar 404 (Not Found) ao tentar apagar uma inspeção que não existe', async () => {
    // Act & Assert
    await request(app.getHttpServer())
      .delete('/inspections/9999')
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .expect(404);
  });
});