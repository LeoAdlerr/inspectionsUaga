import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { setupE2eTest } from '../test-setup.helper';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';
import { RoleEntity } from 'src/infra/typeorm/entities/role.entity';
import { jwtDecode } from 'jwt-decode';
import { ChangePasswordDto } from 'src/api/dtos/change-password.dto';

describe('Auth E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepo: Repository<UserEntity>;
  let roleRepo: Repository<RoleEntity>;
  let clearDatabase: () => Promise<void>;
  let testUser: UserEntity;
  let authToken: string;

  const testCredentials = {
    username: 'testuser',
    password: 'password123',
  };

  beforeAll(async () => {
    ({ app, dataSource, clearDatabase } = await setupE2eTest());
    userRepo = dataSource.getRepository(UserEntity);
    roleRepo = dataSource.getRepository(RoleEntity);
  });

  beforeEach(async () => {
    await clearDatabase();

    // Criamos a role e o usuário necessários para os testes
    await roleRepo.save(roleRepo.create({ id: 3, name: 'INSPECTOR' }));
    const passwordHash = await bcrypt.hash(testCredentials.password, 10);
    testUser = await userRepo.save(userRepo.create({
      fullName: 'E2E Test User',
      username: testCredentials.username,
      passwordHash,
      isActive: true,
      signaturePath: 'path/to/my_signature.png', // Incluindo o novo campo
      roles: [{ id: 3 }] as RoleEntity[],
    }));

    // Fazemos o login para obter o token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginIdentifier: testCredentials.username,
        password: testCredentials.password,
      });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await clearDatabase();
    await app.close();
  });

  it('deve alterar a senha com sucesso com as credenciais corretas', async () => {
    const dto: ChangePasswordDto = {
      oldPassword: testCredentials.password,
      newPassword: 'new_password_456'
    };

    await request(app.getHttpServer())
      .patch('/auth/change-my-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto)
      .expect(204);
  });

  it('deve retornar 401 se a senha antiga estiver incorreta', async () => {
    const dto: ChangePasswordDto = {
      oldPassword: 'wrong_old_password',
      newPassword: 'new_password_456'
    };

    await request(app.getHttpServer())
      .patch('/auth/change-my-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto)
      .expect(401);
  });

  describe('[GET /auth/me]', () => {
    it('deve retornar os dados do usuário autenticado, incluindo o signaturePath', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toEqual(testUser.id);
      expect(response.body.username).toEqual(testUser.username);
      expect(response.body.signaturePath).toEqual(testUser.signaturePath);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('deve retornar 401 (Unauthorized) se nenhum token for fornecido', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });
});


