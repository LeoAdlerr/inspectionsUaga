import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { UserEntity } from 'src/infra/typeorm/entities/user.entity';

export async function setupE2eTest() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  await app.init();

  const dataSource = moduleFixture.get<DataSource>(DataSource);

  const clearDatabase = async () => {
    const repository = dataSource.getRepository(UserEntity);
    await repository.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    // Limpamos tabelas na ordem de dependência inversa
    await repository.query('TRUNCATE TABLE item_evidences;');
    await repository.query('TRUNCATE TABLE inspection_checklist_items;');
    await repository.query('TRUNCATE TABLE inspections;');
    
    // Limpamos a tabela de junção ANTES da tabela de usuários
    await repository.query('TRUNCATE TABLE user_roles;');
    await repository.query('TRUNCATE TABLE users;');
    
    await repository.query('SET FOREIGN_KEY_CHECKS = 1;');
  };

  const clearUploads = () => {
    const uploadsDir = 'uploads';
    if (fs.existsSync(uploadsDir)) {
      const entries = fs.readdirSync(uploadsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name !== 'tmp') {
          fs.rmSync(`${uploadsDir}/${entry.name}`, { recursive: true, force: true });
        }
      }
    }
  };

  return { app, dataSource, clearDatabase, clearUploads };
}