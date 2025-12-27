import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { setupE2eTest } from '../test-setup.helper';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';

describe('Roles E2E - [GET /roles]', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepo: Repository<UserEntity>;
  let clearDatabase: () => Promise<void>;
  let authToken: string;

  beforeAll(async () => {
    ({ app, dataSource, clearDatabase } = await setupE2eTest());
    userRepo = dataSource.getRepository(UserEntity);

    // Arrange: Criamos um usuário e fazemos login para obter um token JWT válido
    await clearDatabase(); // Garante que começamos do zero
    const passwordHash = await bcrypt.hash('senha123', 10);
    await userRepo.save(userRepo.create({
        fullName: 'E2E Roles User',
        username: 'e2erolesuser',
        passwordHash,
        isActive: true,
    }));

    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ loginIdentifier: 'e2erolesuser', password: 'senha123' });
    
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await clearDatabase();
    await app.close();
  });

  it('deve retornar a lista de roles para um usuário autenticado', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get('/roles')
      .set('Authorization', `Bearer ${authToken}`) // Enviamos o token de autenticação
      .expect(200);

    // Assert
    expect(Array.isArray(response.body)).toBe(true);
    // Com base no nosso DDL, esperamos 5 roles
    expect(response.body).toHaveLength(5); 
    // Verificamos se uma das roles esperadas está presente
    expect(response.body).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ name: 'ADMIN' })
        ])
    );
  });

  it('deve retornar 401 (Unauthorized) se nenhum token for fornecido', async () => {
    // Act & Assert
    await request(app.getHttpServer())
      .get('/roles')
      // Não enviamos o cabeçalho de autorização
      .expect(401);
  });
});