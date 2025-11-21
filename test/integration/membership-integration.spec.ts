import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateMembershipDto } from '../../src/modules/membership/infrastructure/dto/create-membership.dto';

describe('Membership Integration', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  describe('get all Membership', () => {
    it('getAllMembership', async () => {
      const response = await request(app.getHttpServer()).get('/membership');
      expect(response.status).toBe(200);
    });
  });
  describe('post membership', () => {
    it('post membership', async () => {
      const membership: CreateMembershipDto = {
        name: 'Plan Enterprise ' + Date.now(),
        price: 89990,
        description:
          'El plan que se adapta a tu negocio para que puedas crecer sin límites',
        functionalities: [
          'Recepcionistas ilimitados',
          'Llamadas ilimitadas',
          'Dashboard Enterprise',
        ],
      };
      const response = await request(app.getHttpServer())
        .post('/membership')
        .send(membership);
      expect(response.status).toBe(201);
      expect(response.body.name).toMatch(/Plan Enterprise/);
    });
  });
});
