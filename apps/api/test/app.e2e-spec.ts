import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as path from 'path';

describe('Atlas API (e2e)', () => {
  let app: INestApplication;
  let testDbDir: string;

  beforeAll(async () => {
    testDbDir = path.join(__dirname, 'tmp-' + Date.now());
    process.env.DB_PATH = testDbDir;
    process.env.JWT_SECRET = 'test-secret';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.setGlobalPrefix('api', { exclude: ['health'] });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (fs.existsSync(testDbDir)) {
      fs.rmSync(testDbDir, { recursive: true, force: true });
    }
  });

  it('/health (GET) returns ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res: any) => {
        expect(res.body.status).toBe('ok');
      });
  });

  it('/api/auth/status returns isSetup:false initially', () => {
    return request(app.getHttpServer())
      .get('/api/auth/status')
      .expect(200)
      .expect((res: any) => {
        expect(res.body.isSetup).toBe(false);
      });
  });

  it('completes setup, logs in, fetches me', async () => {
    // Setup
    const setup = await request(app.getHttpServer())
      .post('/api/auth/setup')
      .send({ name: 'Owner', email: 'owner@test.com', password: 'secret123' })
      .expect(200);
    expect(setup.body.success).toBe(true);
    const cookies = setup.headers['set-cookie'];
    expect(cookies).toBeDefined();

    // /me
    const me = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookies)
      .expect(200);
    expect(me.body.email).toBe('owner@test.com');
    expect(me.body.role).toBe('owner');

    // Login
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'owner@test.com', password: 'secret123' })
      .expect(200);
    expect(login.body.success).toBe(true);

    // Providers list (empty)
    const providers = await request(app.getHttpServer())
      .get('/api/providers')
      .set('Cookie', login.headers['set-cookie'])
      .expect(200);
    expect(Array.isArray(providers.body)).toBe(true);
  });
});
