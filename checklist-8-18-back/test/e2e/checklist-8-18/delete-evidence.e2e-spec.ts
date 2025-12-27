import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { setupE2eTest } from '../test-setup.helper';
import { ItemEvidenceEntity } from 'src/infra/typeorm/entities/item-evidence.entity';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [DELETE /inspections/:id/points/:pointNumber/evidence]', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let evidenceRepo: Repository<ItemEvidenceEntity>;
  let userRepo: Repository<UserEntity>;
  let clearDatabase: () => Promise<void>;
  let clearUploads: () => void;
  let authToken: string;
  let testInspector: UserEntity;

  const fixturesDir = path.join(__dirname, 'fixtures');

  beforeAll(async () => {
    ({ app, dataSource, clearDatabase, clearUploads } = await setupE2eTest());
    evidenceRepo = dataSource.getRepository(ItemEvidenceEntity);
    userRepo = dataSource.getRepository(UserEntity);
    if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir);

    // Criamos um usuário e obtemos o token uma vez
    const passwordHash = await bcrypt.hash('senha123', 10);
    testInspector = await userRepo.save(userRepo.create({
      fullName: 'E2E Evidence Deleter',
      username: 'e2eevidencedeleter',
      passwordHash, isActive: true,
    }));
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginIdentifier: 'e2eevidencedeleter', password: 'senha123' });
    authToken = loginResponse.body.access_token;
  });

  afterEach(async () => {
    clearUploads();
  });

  afterAll(async () => {
    await clearDatabase();
    await app.close();
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    }
  });

  it('deve apagar uma evidência com sucesso', async () => {
    // Arrange
    const createDto: CreateInspectionDto = { inspectorId: testInspector.id, driverName: 'Test Driver', modalityId: 1, operationTypeId: 1, unitTypeId: 1 };
    const createResponse = await request(app.getHttpServer()).post('/inspections').set('Authorization', `Bearer ${authToken}`).send(createDto).expect(201);
    const inspectionId = createResponse.body.id;
    const pointNumber = 3;

    const evidenceFile = path.join(fixturesDir, 'evidence-to-delete.png');
    fs.writeFileSync(evidenceFile, 'delete-me');
    const uploadResponse = await request(app.getHttpServer())
      .post(`/inspections/${inspectionId}/points/${pointNumber}/evidence`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', evidenceFile)
      .expect(201);

    const { id: evidenceId, fileName, filePath } = uploadResponse.body;
    const fullFilePath = path.join(process.cwd(), filePath);
    expect(fs.existsSync(fullFilePath)).toBe(true);

    // Act
    await request(app.getHttpServer())
      .delete(`/inspections/${inspectionId}/points/${pointNumber}/evidence`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ fileName })
      .expect(200);

    // Assert
    const evidenceAfterDelete = await evidenceRepo.findOneBy({ id: evidenceId });
    expect(evidenceAfterDelete).toBeNull();
    expect(fs.existsSync(fullFilePath)).toBe(false);
  });

  it('deve retornar 404 (Not Found) se a evidência a ser apagada não existir', async () => {
    // Arrange
    const createDto: CreateInspectionDto = { inspectorId: testInspector.id, driverName: 'Test Driver', modalityId: 1, operationTypeId: 1, unitTypeId: 1 };
    const createResponse = await request(app.getHttpServer()).post('/inspections').set('Authorization', `Bearer ${authToken}`).send(createDto).expect(201);
    const inspectionId = createResponse.body.id;
    const pointNumber = 1;
    const nonExistentFile = 'fantasma.jpg';

    // Act & Assert
    await request(app.getHttpServer())
      .delete(`/inspections/${inspectionId}/points/${pointNumber}/evidence`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ fileName: nonExistentFile })
      .expect(404);
  });
});