import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth smoke (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });
  afterAll(() => app?.close());

  it('rejects unauthenticated protected requests', () => request(app.getHttpServer()).get('/api/dashboard/stats').expect(401));
  it('validates the login contract', () => request(app.getHttpServer()).post('/api/auth/login').send({ identifier: 'missing@dot.dz', password: 'not-a-real-password' }).expect(401));
  it('logs in a seeded user and returns both token types', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/login').send({ identifier: 'n.ferdi@dot.dz', password: 'Massar123!' }).expect(201);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.user.email).toBe('n.ferdi@dot.dz');
  });
});
