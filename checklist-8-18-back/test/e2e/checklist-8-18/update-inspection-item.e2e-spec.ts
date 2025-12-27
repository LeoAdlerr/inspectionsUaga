import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { setupE2eTest } from '../test-setup.helper';
import { InspectionChecklistItemEntity } from 'src/infra/typeorm/entities/inspection-checklist-item.entity';
import { UpdateInspectionChecklistItemDto } from 'src/api/dtos/update-inspection-checklist-item.dto';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [PATCH /inspections/:id/points/:pointNumber]', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let itemRepo: Repository<InspectionChecklistItemEntity>;
  let userRepo: Repository<UserEntity>;
  let clearDatabase: () => Promise<void>;
  let authToken: string;
  let testInspectionId: number;

  beforeAll(async () => {
    ({ app, dataSource, clearDatabase } = await setupE2eTest());
    itemRepo = dataSource.getRepository(InspectionChecklistItemEntity);
    userRepo = dataSource.getRepository(UserEntity);
  });

  beforeEach(async () => {
    await clearDatabase();
    // Criamos um usuário e obtemos o token
    const passwordHash = await bcrypt.hash('senha123', 10);
    const testInspector = await userRepo.save(userRepo.create({
      fullName: 'E2E Item Updater',
      username: 'e2eitemupdater',
      passwordHash,
      isActive: true,
    }));

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginIdentifier: 'e2eitemupdater', password: 'senha123' });
    authToken = loginResponse.body.access_token;

    // Usamos o token para criar a inspeção
    const createDto: CreateInspectionDto = {
      inspectorId: testInspector.id,
      driverName: 'Test Driver',
      modalityId: 1,
      operationTypeId: 1,
      unitTypeId: 1,
    };
    const response = await request(app.getHttpServer())
      .post('/inspections')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createDto)
      .expect(201);

    testInspectionId = response.body.id;
  });

  afterAll(async () => {
    await clearDatabase();
    await app.close();
  });

  it('deve atualizar um item do checklist com dados válidos', async () => {
    // Arrange
    const pointToUpdate = 5;
    const updateDto: UpdateInspectionChecklistItemDto = {
      statusId: 3, // 3 = NAO_CONFORME
      observations: 'Item atualizado via teste E2E',
    };

    // Act
    await request(app.getHttpServer())
      .patch(`/inspections/${testInspectionId}/points/${pointToUpdate}`)
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .send(updateDto)
      .expect(200);

    // Assert
    const updatedItem = await itemRepo.findOneBy({ inspectionId: testInspectionId, masterPointId: pointToUpdate });

    // Primeiro, garantimos que o item foi encontrado no banco.
    expect(updatedItem).not.toBeNull();
    // Depois, verificamos a propriedade, usando '!' para "dizer" ao TypeScript que confiamos que não é nulo.
    expect(updatedItem!.statusId).toBe(updateDto.statusId);
  });

  it('deve retornar 404 (Not Found) ao tentar atualizar um ponto inexistente', async () => {
    // Arrange
    const invalidPoint = 99;
    const updateDto: UpdateInspectionChecklistItemDto = { statusId: 2, observations: 'OK' };

    // Act & Assert
    await request(app.getHttpServer())
      .patch(`/inspections/${testInspectionId}/points/${invalidPoint}`)
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .send(updateDto)
      .expect(404);
  });

  it('deve retornar 400 (Bad Request) se os dados do DTO forem inválidos', async () => {
    // Arrange
    const pointToUpdate = 3;
    const invalidDto = { statusId: 'um-texto-invalido' };

    // Act & Assert
    await request(app.getHttpServer())
      .patch(`/inspections/${testInspectionId}/points/${pointToUpdate}`)
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .send(invalidDto)
      .expect(400);
  });
});