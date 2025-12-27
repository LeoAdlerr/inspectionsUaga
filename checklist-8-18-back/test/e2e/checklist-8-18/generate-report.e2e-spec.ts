import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { setupE2eTest } from '../test-setup.helper';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UpdateInspectionChecklistItemDto } from 'src/api/dtos/update-inspection-checklist-item.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [GET /inspections/:id/report/...]', () => {
  let app: INestApplication;
  let userRepo: Repository<UserEntity>;
  let clearDatabase: () => Promise<void>;

  let authToken: string;
  let testInspector: UserEntity;

  beforeAll(async () => {
    const setup = await setupE2eTest();
    app = setup.app;
    clearDatabase = setup.clearDatabase;
    userRepo = setup.dataSource.getRepository(UserEntity);

    // Criamos um usuário e fazemos login UMA VEZ para obter o token
    await clearDatabase(); // Limpa para garantir que o usuário não existe
    const passwordHash = await bcrypt.hash('senha123', 10);
    testInspector = await userRepo.save(userRepo.create({
      fullName: 'E2E Report User',
      username: 'e2ereportuser',
      passwordHash,
      isActive: true,
    }));

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginIdentifier: 'e2ereportuser', password: 'senha123' });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await clearDatabase();
    await app.close();
  });

  // Função auxiliar para criar uma inspeção já autenticado
  const createTestInspection = async () => {
    const createDto: CreateInspectionDto = {
      inspectorId: testInspector.id,
      driverName: 'Test Driver',
      modalityId: 1, operationTypeId: 1, unitTypeId: 1,
    };
    const response = await request(app.getHttpServer())
      .post('/inspections')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createDto)
      .expect(201);
    return response.body.id;
  }

  it('GET .../report/pdf - deve retornar um arquivo PDF para uma inspeção finalizada', async () => {
    // Arrange
    const inspectionId = await createTestInspection();
    const statusesResponse = await request(app.getHttpServer()).get('/lookups/checklist-item-statuses').set('Authorization', `Bearer ${authToken}`);
    const conformeStatusId = statusesResponse.body.find(s => s.name === 'CONFORME')?.id;
    const conformeDto: UpdateInspectionChecklistItemDto = { statusId: conformeStatusId };

    for (let point = 1; point <= 18; point++) {
      await request(app.getHttpServer())
        .patch(`/inspections/${inspectionId}/points/${point}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(conformeDto).expect(200);
    }
    await request(app.getHttpServer()).patch(`/inspections/${inspectionId}/finalize`).set('Authorization', `Bearer ${authToken}`).expect(200);

    // Act & Assert
    await request(app.getHttpServer())
      .get(`/inspections/${inspectionId}/report/pdf`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('deve retornar 400 (Bad Request) ao tentar gerar relatório para uma inspeção não finalizada', async () => {
    // Arrange
    const inspectionId = await createTestInspection();

    // Act & Assert
    await request(app.getHttpServer())
      .get(`/inspections/${inspectionId}/report/pdf`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);
  });
});