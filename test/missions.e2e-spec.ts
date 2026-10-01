import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Missions smoke (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  beforeAll(async () => { const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile(); app = moduleRef.createNestApplication(); app.setGlobalPrefix('api'); app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); await app.init(); });
  afterAll(() => app?.close());
  it('returns a structured not-found response after authentication is omitted', () => request(app.getHttpServer()).get('/api/missions/MISSING').expect(401));
  it('lists and creates a mission through the protected CRUD API', async () => {
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ identifier: 'n.ferdi@dot.dz', password: 'Massar123!' }).expect(201);
    accessToken = login.body.accessToken;
    const list = await request(app.getHttpServer()).get('/api/missions?limit=2').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(list.body.data).toHaveLength(2);
    const created = await request(app.getHttpServer()).post('/api/missions').set('Authorization', `Bearer ${accessToken}`).send({ type: 'interne', object: 'E2E smoke mission', departure: 'Alger', destination: 'Blida', departureDate: '2026-12-01', departureTime: '08:00', passengers: 1, vehicleNeeded: false }).expect(201);
    expect(created.body.id).toMatch(/^M2026-/);
    await request(app.getHttpServer()).delete(`/api/missions/${created.body.id}`).set('Authorization', `Bearer ${accessToken}`).expect(200);
  });
});
