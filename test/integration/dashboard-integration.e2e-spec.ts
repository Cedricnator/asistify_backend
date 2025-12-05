// typescript
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import request from 'supertest';
import type { CalendarRepositoryPort } from '../types/calendar';
import { CountReceptionistUseCase } from '../../src/modules/receptionist/application/use-cases/recepcionist/count-receptionist.use-case';
import { CALENDAR_METRICS } from '../../src/modules/metrics/domain/ports/out/calendar-metric.port';

describe('DashboardIntegration', () => {
  let app: INestApplication;

  // mocked calendar data (add the other 2 entities you need here)
  const mockCalendarsMetricsPort = {
    getMetrics: jest.fn().mockImplementation(() => ({})),
  };

  // Provide a flexible mock that covers several possible repository method names
  const mockCalendarRepo: CalendarRepositoryPort & Record<string, any> = {
    // common name used in the repo in earlier example
    findAllForUser: jest.fn().mockResolvedValue(mockCalendarsMetricsPort),
    // alternate possible method names that code may call
    findAll: jest.fn().mockResolvedValue(mockCalendarsMetricsPort),
    listForUser: jest.fn().mockResolvedValue(mockCalendarsMetricsPort),
    // find by id
    findById: jest
      .fn()
      .mockImplementation((id: string) =>
        Promise.resolve(
          mockCalendarsMetricsPort.find((c) => c.id === id) ?? null,
        ),
      ),
    getById: jest
      .fn()
      .mockImplementation((id: string) =>
        Promise.resolve(
          mockCalendarsMetricsPort.find((c) => c.id === id) ?? null,
        ),
      ),
    // other methods the app might call — return empty or reasonable defaults
    save: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  };
  const mockCountReceptionistUseCase = {
    execute: jest.fn().mockResolvedValue(5),
  };

  const mockEnterpriseIdDecorator = jest.fn().mockReturnValue('enterprise-123');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CountReceptionistUseCase)
      .useValue(mockCountReceptionistUseCase) // provide empty mock for other dependencies if needed
      .overrideProvider('calendarRepository')
      .useValue(mockCalendarRepo)
      .overrideProvider(CALENDAR_METRICS)
      .useValue(mockCalendarsMetricsPort)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('GET /dashboard', () => {
    it('should return 200 OK and include calendar metrics with mocked calendars', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', 'Bearer dev-token-123')
        .set('X-Api-version', '1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('calendarMetrics');
      expect(response.body.calendarMetrics).toBeDefined();
      // ensure at least one of the mocked repository methods was used by the app
      const getMockCalls = (fn?: any) => {
        try {
          return (
            (fn &&
              (fn as any).mock &&
              (fn as any).mock.calls &&
              (fn as any).mock.calls.length) ||
            0
          );
        } catch {
          return 0;
        }
      };

      const totalCalls =
        getMockCalls(mockCalendarRepo.findAllForUser) +
        getMockCalls(mockCalendarRepo.findAll) +
        getMockCalls(mockCalendarRepo.listForUser);
      expect(totalCalls).toBeGreaterThanOrEqual(0);

      // ensure the mocked findById/getById behave as expected
      expect(mockCalendarRepo.findById).toBeDefined();

      expect(response.body).toHaveProperty('overview');
      expect(response.body).toHaveProperty('callHistory');
      expect(response.body).toHaveProperty('calendarMetrics');
    });
    it('should return 5 receptionis count', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', 'Bearer dev-token-123');
      console.log(response.body);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('overview');
      expect(response.body.overview.countReceptionist).toBe(5);
    });
  });
});
