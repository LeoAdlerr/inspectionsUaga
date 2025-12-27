import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { setupE2eTest } from '../test-setup.helper';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [GET /inspections]', () => {
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

    // Criamos um usuário e obtemos o token
    const passwordHash = await bcrypt.hash('senha123', 10);
    testInspector = await userRepo.save(userRepo.create({
        fullName: 'E2E FindAll User',
        username: 'e2efindalluser',
        passwordHash,
        isActive: true,
    }));
    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginIdentifier: 'e2efindalluser', password: 'senha123' });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await clearDatabase();
    await app.close();
  });

  it('deve retornar na lista as inspeções que foram criadas', async () => {
    // Arrange
    const createdInspections = await inspectionRepo.save([
      inspectionRepo.create({
        inspectorId: testInspector.id,
        driverName: 'E2E Driver A',
        statusId: 1, modalityId: 1, operationTypeId: 1, unitTypeId: 1, startDatetime: new Date(),
      }),
      inspectionRepo.create({
        inspectorId: testInspector.id,
        driverName: 'E2E Driver B',
        statusId: 1, modalityId: 2, operationTypeId: 1, unitTypeId: 1, startDatetime: new Date(),
      }),
    ]);

    // Act
    const response = await request(app.getHttpServer())
      .get('/inspections')
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .expect(200);

    // Assert
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: createdInspections[0].id }),
        expect.objectContaining({ id: createdInspections[1].id }),
      ])
    );
  });

  it('deve garantir que uma inspeção apagada não está na lista', async () => {
    // Arrange
    const inspectionToHide = await inspectionRepo.save(
        inspectionRepo.create({
            inspectorId: testInspector.id,
            driverName: 'Ghost Driver',
            statusId: 1, modalityId: 1, operationTypeId: 1, unitTypeId: 1, startDatetime: new Date(),
        })
    );
    await inspectionRepo.delete({ id: inspectionToHide.id });
    
    // Act
    const response = await request(app.getHttpServer())
      .get('/inspections')
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .expect(200);

    // Assert
    expect(response.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: inspectionToHide.id }),
      ])
    );
  });
});