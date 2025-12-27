import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { setupE2eTest } from '../test-setup.helper';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Inspections E2E - [POST /inspections]', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepo: Repository<UserEntity>;
    let clearDatabase: () => Promise<void>;
    let authToken: string; 
    let testInspector: UserEntity;

    beforeAll(async () => {
        ({ app, dataSource, clearDatabase } = await setupE2eTest());
        userRepo = dataSource.getRepository(UserEntity);

        // Criamos um inspetor de teste e fazemos login para obter o token
        const passwordHash = await bcrypt.hash('senha123', 10);
        testInspector = await userRepo.save(userRepo.create({
            fullName: 'Inspetor de Teste E2E',
            username: 'inspectore2e',
            passwordHash,
            isActive: true,
        }));

        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ loginIdentifier: 'inspectore2e', password: 'senha123' });
        authToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
        await clearDatabase();
        await app.close();
    });

    it('deve criar uma inspeção Rodoviária com 18 itens no checklist', async () => {
        // Arrange
        const createDto: CreateInspectionDto = {
            inspectorId: testInspector.id,
            driverName: 'E2E Driver Rodo',
            modalityId: 1, // 1 = RODOVIARIO
            operationTypeId: 1,
            unitTypeId: 1,
        };

        // Act
        const createResponse = await request(app.getHttpServer())
            .post('/inspections')
            .set('Authorization', `Bearer ${authToken}`) 
            .send(createDto)
            .expect(201);
        
        const inspectionId = createResponse.body.id;

        // Assert
        const getResponse = await request(app.getHttpServer())
            .get(`/inspections/${inspectionId}`)
            .set('Authorization', `Bearer ${authToken}`) 
            .expect(200);

        expect(getResponse.body.items).toHaveLength(18);
    });

    it('deve criar uma inspeção Marítima com 11 itens no checklist', async () => {
        // Arrange
        const createDto: CreateInspectionDto = {
            inspectorId: testInspector.id,
            driverName: 'E2E Driver Maritimo',
            modalityId: 2, // 2 = MARITIMO
            operationTypeId: 1,
            unitTypeId: 1,
        };

        // Act
        const createResponse = await request(app.getHttpServer())
            .post('/inspections')
            .set('Authorization', `Bearer ${authToken}`) 
            .send(createDto)
            .expect(201);
        
        const inspectionId = createResponse.body.id;

        // Assert
        const getResponse = await request(app.getHttpServer())
            .get(`/inspections/${inspectionId}`)
            .set('Authorization', `Bearer ${authToken}`) 
            .expect(200);
        
        expect(getResponse.body.items).toHaveLength(11);
    });
});