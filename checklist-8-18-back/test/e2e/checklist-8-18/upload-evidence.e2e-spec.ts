import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { setupE2eTest } from '../test-setup.helper';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [POST /inspections/:id/points/:pointNumber/evidence]', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepo: Repository<UserEntity>;
  let clearDatabase: () => Promise<void>;
  let clearUploads: () => void;
  let authToken: string;

  let testInspectionId: number;
  const fixturesDir = path.join(__dirname, 'fixtures');

  beforeAll(async () => {
    ({ app, dataSource, clearDatabase, clearUploads } = await setupE2eTest());
    userRepo = dataSource.getRepository(UserEntity);
    if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir);
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Criamos um usuário e obtemos o token
    const passwordHash = await bcrypt.hash('senha123', 10);
    const testInspector = await userRepo.save(userRepo.create({
        fullName: 'E2E Upload User',
        username: 'e2euploaduser',
        passwordHash,
        isActive: true,
    }));
    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginIdentifier: 'e2euploaduser', password: 'senha123' });
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

  afterEach(async () => {
    await clearDatabase();
    clearUploads();
  });

  afterAll(async () => {
    await app.close();
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    }
  });

  it('deve fazer o upload de uma evidência com sucesso', async () => {
    // Arrange
    const pointNumber = 1;
    const evidenceFile = path.join(fixturesDir, 'test-image.png');
    fs.writeFileSync(evidenceFile, 'fake-image-content');

    // Act
    const response = await request(app.getHttpServer())
      .post(`/inspections/${testInspectionId}/points/${pointNumber}/evidence`)
      .set('Authorization', `Bearer ${authToken}`) // Usa o token
      .attach('file', evidenceFile)
      .expect(201);

    // Assert
    expect(response.body.fileName).toBeDefined();
    const uploadedFilePath = path.join(process.cwd(), response.body.filePath);
    expect(fs.existsSync(uploadedFilePath)).toBe(true);
  });
});