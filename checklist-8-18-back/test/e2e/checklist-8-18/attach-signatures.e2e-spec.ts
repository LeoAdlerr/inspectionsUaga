import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { setupE2eTest } from '../test-setup.helper';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { RoleEntity } from 'src/infra/typeorm/entities/role.entity';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';

describe('Inspections E2E - [POST /inspections/:id/signatures]', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepo: Repository<UserEntity>;
    let roleRepo: Repository<RoleEntity>;
    let inspectionRepo: Repository<InspectionEntity>;
    let clearDatabase: () => Promise<void>;
    let clearUploads: () => void;

    let authToken: string;
    let inspector: UserEntity;
    let inspectionId: number;

    const fixturesDir = path.join(__dirname, 'fixtures');

    const createFakeFile = (fileName: string, content = 'fake-data') => {
        if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });
        const filePath = path.join(fixturesDir, fileName);
        fs.writeFileSync(filePath, content);
        return filePath;
    };

    beforeAll(async () => {
        const setup = await setupE2eTest();
        app = setup.app;
        dataSource = setup.dataSource;
        clearDatabase = setup.clearDatabase;
        clearUploads = setup.clearUploads;

        userRepo = dataSource.getRepository(UserEntity);
        roleRepo = dataSource.getRepository(RoleEntity);
        inspectionRepo = dataSource.getRepository(InspectionEntity);

        await clearDatabase();
        clearUploads();

        // Cria papel e inspetor
        await roleRepo.save({ id: 3, name: 'INSPECTOR' });

        const profileSignatureName = 'user_1_profile_sig.png';
        const profileSignaturePath = 'uploads/signatures';
        const fullProfileSignaturePath = path.join(process.cwd(), profileSignaturePath, profileSignatureName);
        fs.mkdirSync(path.dirname(fullProfileSignaturePath), { recursive: true });
        fs.writeFileSync(fullProfileSignaturePath, 'fake-profile-signature-data');

        const passwordHash = await bcrypt.hash('password123', 10);
        inspector = await userRepo.save({
            fullName: 'Inspetor E2E Assinatura',
            username: 'inspector_sig_e2e',
            passwordHash,
            isActive: true,
            signaturePath: path.join(profileSignaturePath, profileSignatureName).replace(/\\/g, '/'),
            roles: [{ id: 3 }],
        });

        // Login
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ loginIdentifier: 'inspector_sig_e2e', password: 'password123' })
            .expect(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(`Expected 2xx, got ${res.status}`);
                }
            });
        authToken = loginResponse.body.access_token;

        // Criação de inspeção
        const createDto: CreateInspectionDto = {
            inspectorId: inspector.id,
            driverName: 'Motorista Teste',
            modalityId: 1,
            operationTypeId: 1,
            unitTypeId: 1,
        };

        const inspectionResponse = await request(app.getHttpServer())
            .post('/inspections')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createDto)
            .expect(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(`Expected 2xx, got ${res.status}`);
                }
            });

        inspectionId = inspectionResponse.body.id;
    });

    afterAll(async () => {
        try {
            await clearDatabase();
            clearUploads();
            if (fs.existsSync(fixturesDir)) fs.rmSync(fixturesDir, { recursive: true, force: true });
            if (dataSource?.isInitialized) await dataSource.destroy();
            if (app) await app.close();
        } catch (err) {
            console.warn('⚠️ Erro ao fechar recursos:', err);
        }
    });

    it('deve fazer o upload de novas assinaturas (inspetor e motorista)', async () => {
        const inspectorSigFile = createFakeFile('new_inspector.png');
        const driverSigFile = createFakeFile('new_driver.png');

        const response = await request(app.getHttpServer())
            .post(`/inspections/${inspectionId}/signatures`)
            .set('Authorization', `Bearer ${authToken}`)
            .attach('inspectorSignature', inspectorSigFile)
            .attach('driverSignature', driverSigFile)
            .expect(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(`Expected 2xx, got ${res.status}`);
                }
            });

        expect(response.body.inspectorSignaturePath).toContain('inspector_signature.png');
        expect(response.body.driverSignaturePath).toContain('driver_signature.png');
        expect(fs.existsSync(path.join(process.cwd(), response.body.inspectorSignaturePath))).toBe(true);
        expect(fs.existsSync(path.join(process.cwd(), response.body.driverSignaturePath))).toBe(true);
    });

    it('deve usar a assinatura do perfil do inspetor se useProfileSignature for true', async () => {
        const driverSigFile = createFakeFile('driver.png');

        const response = await request(app.getHttpServer())
            .post(`/inspections/${inspectionId}/signatures`)
            .set('Authorization', `Bearer ${authToken}`)
            .field('useProfileSignature', 'true')
            .attach('driverSignature', driverSigFile)
            .expect(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(`Expected 2xx, got ${res.status}`);
                }
            });

        expect(response.body.inspectorSignaturePath).toContain('user_1_profile_sig.png');
        expect(response.body.driverSignaturePath).toContain('driver_signature.png');
        expect(fs.existsSync(path.join(process.cwd(), response.body.inspectorSignaturePath))).toBe(true);
        expect(fs.existsSync(path.join(process.cwd(), response.body.driverSignaturePath))).toBe(true);
    });

    it('deve retornar 400 se useProfileSignature for true mas o usuário não tiver assinatura', async () => {
        const passwordHash = await bcrypt.hash('pass123', 10);
        const userNoSig = await userRepo.save({
            fullName: 'Sem Assinatura',
            username: 'nosig',
            passwordHash,
            isActive: true,
            roles: [{ id: 3 }],
        });

        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ loginIdentifier: 'nosig', password: 'pass123' })
            .expect(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(`Expected 2xx, got ${res.status}`);
                }
            });

        const userNoSigToken = loginResponse.body.access_token;

        await request(app.getHttpServer())
            .post(`/inspections/${inspectionId}/signatures`)
            .set('Authorization', `Bearer ${userNoSigToken}`)
            .field('useProfileSignature', 'true')
            .expect(400);
    });
});
