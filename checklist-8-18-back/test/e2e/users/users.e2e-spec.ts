import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { setupE2eTest } from '../test-setup.helper';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { RoleEntity } from 'src/infra/typeorm/entities/role.entity';
import { CreateUserDto } from 'src/api/dtos/create-user.dto';
import { UpdateUserDto } from 'src/api/dtos/update-user.dto';

describe('Users E2E - [CRUD /users]', () => {
    let app: INestApplication;
    let userRepo: Repository<UserEntity>;
    let roleRepo: Repository<RoleEntity>;
    let clearDatabase: () => Promise<void>;
    let clearUploads: () => void;

    let adminToken: string;
    let inspectorToken: string;
    let targetUser: UserEntity;

    const fixturesDir = path.join(__dirname, 'fixtures');

    beforeAll(async () => {
        const setup = await setupE2eTest();
        app = setup.app;
        clearDatabase = setup.clearDatabase;
        clearUploads = setup.clearUploads;
        userRepo = setup.dataSource.getRepository(UserEntity);
        roleRepo = setup.dataSource.getRepository(RoleEntity);
        if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir);
    });

    beforeEach(async () => {
        await clearDatabase();
        clearUploads();

        await roleRepo.save([
            { id: 1, name: 'ADMIN' },
            { id: 3, name: 'INSPECTOR' },
        ]);

        const adminPassword = await bcrypt.hash('admin_pass', 10);
        await userRepo.save({ fullName: 'Admin E2E', username: 'admin_e2e', passwordHash: adminPassword, isActive: true, roles: [{ id: 1 }] });
        const loginAdminResponse = await request(app.getHttpServer()).post('/auth/login').send({ loginIdentifier: 'admin_e2e', password: 'admin_pass' });
        adminToken = loginAdminResponse.body.access_token;

        const targetPassword = await bcrypt.hash('target_pass', 10);
        targetUser = await userRepo.save({ fullName: 'Target User', username: 'target_user', passwordHash: targetPassword, isActive: true, roles: [{ id: 3 }] });
        const loginInspectorResponse = await request(app.getHttpServer()).post('/auth/login').send({ loginIdentifier: 'target_user', password: 'target_pass' });
        inspectorToken = loginInspectorResponse.body.access_token;
    });

    afterAll(async () => {
        await clearDatabase();
        await app.close();
        if (fs.existsSync(fixturesDir)) fs.rmSync(fixturesDir, { recursive: true, force: true });
    });

    describe('[GET /users]', () => {
        it('deve listar usuários para um usuário autenticado', async () => {
            const response = await request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${adminToken}`).expect(200);
            expect(response.body).toHaveLength(2); // admin e targetUser
        });
    });

    describe('[GET /users/:id]', () => {
        it('deve retornar um usuário específico para um Admin', async () => {
            const response = await request(app.getHttpServer()).get(`/users/${targetUser.id}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
            expect(response.body.id).toEqual(targetUser.id);
            expect(response.body.username).toEqual('target_user');
        });
    });

    describe('[POST /users]', () => {
        it('deve permitir que um Admin crie um novo usuário', async () => {
            const newUserDto: CreateUserDto = { fullName: 'Novo Conferente', username: 'nconferente', password: 'password123', roleIds: [4] };
            await roleRepo.save(roleRepo.create({ id: 4, name: 'CONFERENTE' }));

            await request(app.getHttpServer()).post('/users').set('Authorization', `Bearer ${adminToken}`).send(newUserDto).expect(201);
        });
    });

    describe('[PATCH /users/:id]', () => {
        it('deve permitir que um Admin atualize um usuário', async () => {
            const updateUserDto: UpdateUserDto = { fullName: 'Target User Updated' };
            const response = await request(app.getHttpServer()).patch(`/users/${targetUser.id}`).set('Authorization', `Bearer ${adminToken}`).send(updateUserDto).expect(200);
            expect(response.body.fullName).toEqual('Target User Updated');
        });
    });

    it('deve permitir que um Admin desative (soft delete) um usuário', async () => {
        await request(app.getHttpServer())
            .delete(`/users/${targetUser.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(204);

        const deactivatedUser = await userRepo.findOneBy({ id: targetUser.id });

        // 1. Garantimos que o usuário não é nulo (prova que não foi um hard delete)
        expect(deactivatedUser).not.toBeNull();
        // 2. Verificamos se o status foi alterado para inativo
        // O '!' diz ao TypeScript que já garantimos que não é nulo.
        expect(deactivatedUser!.isActive).toBe(false);
    });

    describe('[POST /users/my-signature]', () => {
        it('deve permitir que um usuário logado faça o upload da sua assinatura', async () => {
            // Arrange
            const signatureFile = path.join(fixturesDir, 'test-signature.png');
            fs.writeFileSync(signatureFile, 'fake-signature-image-data');

            // Act
            const response = await request(app.getHttpServer())
                .post('/users/my-signature')
                .set('Authorization', `Bearer ${inspectorToken}`)
                .attach('signature', signatureFile)
                .expect(200);

            // Assert
            expect(response.body.signaturePath).toBeDefined();
            expect(response.body.signaturePath).toContain('uploads/signatures/user_');

            // Verifica no banco e no disco
            const updatedUser = await userRepo.findOneBy({ id: targetUser.id });

            // 1. Garantimos que o usuário foi encontrado no banco
            expect(updatedUser).not.toBeNull();
            expect(updatedUser!.signaturePath).not.toBeNull();

            // 2. Agora podemos usar a propriedade com segurança.
            expect(updatedUser!.signaturePath).toEqual(response.body.signaturePath);
            expect(fs.existsSync(path.join(process.cwd(), updatedUser!.signaturePath!))).toBe(true);
        });
    });

    describe('[DELETE /users/my-signature]', () => {
        it('deve permitir que um usuário logado apague a sua assinatura', async () => {
            // Arrange: Primeiro, fazemos o upload de uma assinatura para garantir que ela existe
            const signatureFile = path.join(fixturesDir, 'signature-to-delete.png');
            fs.writeFileSync(signatureFile, 'delete-me');
            const uploadResponse = await request(app.getHttpServer())
                .post('/users/my-signature')
                .set('Authorization', `Bearer ${inspectorToken}`)
                .attach('signature', signatureFile);

            const signaturePath = uploadResponse.body.signaturePath;
            expect(fs.existsSync(path.join(process.cwd(), signaturePath))).toBe(true);

            // Act: Agora, apagamos a assinatura
            const deleteResponse = await request(app.getHttpServer())
                .delete('/users/my-signature')
                .set('Authorization', `Bearer ${inspectorToken}`)
                .expect(200);

            // Assert
            expect(deleteResponse.body.signaturePath).toBeNull();

            // Verificamos no banco e no disco
            const updatedUser = await userRepo.findOneBy({ id: targetUser.id });
            expect(updatedUser!.signaturePath).toBeNull();
            expect(fs.existsSync(path.join(process.cwd(), signaturePath))).toBe(false);
        });
    });
});