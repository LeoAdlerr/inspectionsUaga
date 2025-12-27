import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { setupE2eTest } from '../test-setup.helper';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [POST /inspections/check-existing]', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepo: Repository<UserEntity>;
  let inspectionRepo: Repository<InspectionEntity>;
  let clearDatabase: () => Promise<void>;
  let authToken: string;
  let testInspector: UserEntity;

  beforeAll(async () => {
    ({ app, dataSource, clearDatabase } = await setupE2eTest());
    userRepo = dataSource.getRepository(UserEntity);
    inspectionRepo = dataSource.getRepository(InspectionEntity);

    // Criamos um usuário e obtemos o token uma vez
    const passwordHash = await bcrypt.hash('senha123', 10);
    testInspector = await userRepo.save(userRepo.create({
      fullName: 'E2E CheckExisting User',
      username: 'e2echeckexisting',
      passwordHash,
      isActive: true,
    }));
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginIdentifier: 'e2echeckexisting', password: 'senha123' });
    authToken = loginResponse.body.access_token;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase(); // Limpeza final
    await app.close();
  });

  it('deve retornar 200 OK e os dados da inspeção se uma similar for encontrada', async () => {
    // Arrange: Usamos a API para criar a inspeção, garantindo que os itens sejam criados
    const createDto: CreateInspectionDto = {
      inspectorId: testInspector.id,
      driverName: 'Motorista Duplicado',
      modalityId: 1,
      operationTypeId: 2,
      unitTypeId: 1,
    };
    const createResponse = await request(app.getHttpServer())
      .post('/inspections')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createDto)
      .expect(201);
    const existingInspectionId = createResponse.body.id;

    // Act
    const response = await request(app.getHttpServer())
      .post('/inspections/check-existing')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createDto)
       expect([200, 201]);

    // Assert
    expect(response.body.id).toEqual(existingInspectionId);
  });

  it('deve retornar 404 Not Found se nenhuma inspeção similar for encontrada', async () => {
    // Arrange
    const dtoToCheck: CreateInspectionDto = {
      inspectorId: testInspector.id,
      driverName: 'Motorista Inexistente',
      modalityId: 1,
      operationTypeId: 1,
      unitTypeId: 1,
    };

    // Act & Assert
    await request(app.getHttpServer())
      .post('/inspections/check-existing')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dtoToCheck)
      .expect(404);
  });
});