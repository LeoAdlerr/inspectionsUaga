import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { setupE2eTest } from '../test-setup.helper';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [GET /inspections/:id]', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let inspectionRepo: Repository<InspectionEntity>;
  let userRepo: Repository<UserEntity>;
  let clearDatabase: () => Promise<void>;
  let authToken: string;

  beforeAll(async () => {
    ({ app, dataSource, clearDatabase } = await setupE2eTest());
    inspectionRepo = dataSource.getRepository(InspectionEntity);
    userRepo = dataSource.getRepository(UserEntity);

    // Criamos um usuário e obtemos o token
    const passwordHash = await bcrypt.hash('senha123', 10);
    await userRepo.save(userRepo.create({
        fullName: 'E2E FindById User',
        username: 'e2efindbyiduser',
        passwordHash,
        isActive: true,
    }));
    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginIdentifier: 'e2efindbyiduser', password: 'senha123' });
    authToken = loginResponse.body.access_token;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve retornar uma inspeção específica pelo seu ID', async () => {
    // Arrange
    const newInspection = await inspectionRepo.save(inspectionRepo.create({
      inspectorId: 1,
      driverName: 'E2E Driver FindById',
      statusId: 1,
      modalityId: 1,
      operationTypeId: 1,
      unitTypeId: 1,
      startDatetime: new Date(),
    }));
    const inspectionId = newInspection.id;

    // Act
    const response = await request(app.getHttpServer())
      .get(`/inspections/${inspectionId}`)
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .expect(200);

    // Assert
    expect(response.body).toBeDefined();
    expect(response.body.id).toEqual(inspectionId);
  });

  it('deve retornar erro 404 (Not Found) se a inspeção não existir', async () => {
    // Act & Assert
    await request(app.getHttpServer())
      .get(`/inspections/9999`)
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .expect(404);
  });
});