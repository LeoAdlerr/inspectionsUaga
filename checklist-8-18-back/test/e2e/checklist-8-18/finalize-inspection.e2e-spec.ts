import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { setupE2eTest } from '../test-setup.helper';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UpdateInspectionChecklistItemDto } from 'src/api/dtos/update-inspection-checklist-item.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [PATCH /inspections/:id/finalize]', () => {
  let app: INestApplication;
  let userRepo: Repository<UserEntity>;
  let clearDatabase: () => Promise<void>;
  let authToken: string;

  beforeAll(async () => {
    const setup = await setupE2eTest();
    app = setup.app;
    clearDatabase = setup.clearDatabase;
    userRepo = setup.dataSource.getRepository(UserEntity);

    // Criamos um usuário e fazemos login para obter o token
    await clearDatabase();
    const passwordHash = await bcrypt.hash('senha123', 10);
    const testInspector = await userRepo.save(userRepo.create({
      fullName: 'E2E Finalize User',
      username: 'e2efinalizeuser',
      passwordHash,
      isActive: true,
    }));

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginIdentifier: 'e2efinalizeuser', password: 'senha123' });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await clearDatabase();
    await app.close();
  });

  // Função auxiliar para criar uma inspeção já autenticado
  const createTestInspection = async () => {
    const createDto: CreateInspectionDto = { inspectorId: 1, driverName: 'Test Driver', modalityId: 1, operationTypeId: 1, unitTypeId: 1 };
    const response = await request(app.getHttpServer())
      .post('/inspections')
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .send(createDto)
      .expect(201);
    return response.body.id;
  }

  // Função auxiliar para preencher o checklist autenticado
  const fillChecklist = async (inspectionId: number, itemsToUpdate: { point: number, status: string }[]) => {
    const statusesResponse = await request(app.getHttpServer()).get('/lookups/checklist-item-statuses').set('Authorization', `Bearer ${authToken}`);
    const statuses = statusesResponse.body;

    for (const item of itemsToUpdate) {
      const statusId = statuses.find(s => s.name === item.status)?.id;
      const dto: UpdateInspectionChecklistItemDto = { statusId };

      await request(app.getHttpServer())
        .patch(`/inspections/${inspectionId}/points/${item.point}`)
        .set('Authorization', `Bearer ${authToken}`) // Usa o token
        .send(dto)
        .expect(200);
    }
  };

  it('deve finalizar como APROVADO se houver 1 item CONFORME e os restantes N/A', async () => {
    // Arrange
    const inspectionId = await createTestInspection();
    // Criamos um array com os 18 pontos, o primeiro como CONFORME e o resto como N/A
    const itemsToSet = Array.from({ length: 18 }, (_, i) => ({
      point: i + 1,
      status: i === 0 ? 'CONFORME' : 'N_A'
    }));
    await fillChecklist(inspectionId, itemsToSet);

    // Act
    const response = await request(app.getHttpServer())
      .patch(`/inspections/${inspectionId}/finalize`)
      .set('Authorization', `Bearer ${authToken}`) 
      .expect(200);
    // Assert
    expect(response.body.statusId).toBe(2); // 2 = APROVADO
  });

  it('deve finalizar como REPROVADO se houver 1 item NAO_CONFORME e os restantes N/A', async () => {
    // Arrange
    const inspectionId = await createTestInspection();
    const itemsToSet = Array.from({ length: 18 }, (_, i) => ({
      point: i + 1,
      status: i === 0 ? 'NAO_CONFORME' : 'N_A'
    }));

    await fillChecklist(inspectionId, itemsToSet);
    // Act
    const response = await request(app.getHttpServer())
      .patch(`/inspections/${inspectionId}/finalize`)
      .set('Authorization', `Bearer ${authToken}`) 
      .expect(200);
    // Assert
    expect(response.body.statusId).toBe(3); // 3 = REPROVADO
  });

  it('deve retornar 400 (Bad Request) se todos os itens forem N/A', async () => {
    // Arrange
    const inspectionId = await createTestInspection();
    const itemsToSet = Array.from({ length: 18 }, (_, i) => ({ point: i + 1, status: 'N_A' }));
    await fillChecklist(inspectionId, itemsToSet);
    // Act & Assert
    await request(app.getHttpServer())
      .patch(`/inspections/${inspectionId}/finalize`)
      .set('Authorization', `Bearer ${authToken}`) 
      .expect(400);
  });
});