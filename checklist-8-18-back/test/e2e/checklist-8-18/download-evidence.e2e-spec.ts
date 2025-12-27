import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { setupE2eTest } from '../test-setup.helper';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [GET /inspections/:id/points/:pointNumber/evidence/:fileName]', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepo: Repository<UserEntity>;
  let clearDatabase: () => Promise<void>;
  let clearUploads: () => void;
  let authToken: string;

  let testInspectionId: number;
  let uploadedFileName: string;
  const pointNumber = 1;
  const fileContent = 'download-e2e-test-content';
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
        fullName: 'E2E Download User',
        username: 'e2edownloaduser',
        passwordHash,
        isActive: true,
    }));

    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginIdentifier: 'e2edownloaduser', password: 'senha123' });
    authToken = loginResponse.body.access_token;
    
    // Usamos o token para criar a inspeção
    const createDto: CreateInspectionDto = {
        inspectorId: testInspector.id,
        driverName: 'Test Driver',
        modalityId: 1, 
        operationTypeId: 1, 
        unitTypeId: 1,
    };
    const createResponse = await request(app.getHttpServer())
        .post('/inspections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);
    testInspectionId = createResponse.body.id;

    // E para fazer o upload
    const evidenceFile = path.join(fixturesDir, 'evidence-for-download.png');
    fs.writeFileSync(evidenceFile, fileContent);

    const uploadResponse = await request(app.getHttpServer())
      .post(`/inspections/${testInspectionId}/points/${pointNumber}/evidence`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', evidenceFile)
      .expect(201);
    
    uploadedFileName = uploadResponse.body.fileName;
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

  it('deve baixar o arquivo de evidência correto', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get(`/inspections/${testInspectionId}/points/${pointNumber}/evidence/${uploadedFileName}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Assert
    expect(response.headers['content-type']).toBe('image/png');
    expect(response.headers['content-disposition']).toContain(`attachment; filename="${uploadedFileName}"`);
    expect(response.body.toString()).toEqual(fileContent);
  });

  it('deve retornar 404 (Not Found) ao tentar baixar uma evidência que não existe', async () => {
    // Arrange
    const nonExistentFile = 'fantasma.jpg';

    // Act & Assert
    await request(app.getHttpServer())
      .get(`/inspections/${testInspectionId}/points/${pointNumber}/evidence/${nonExistentFile}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});