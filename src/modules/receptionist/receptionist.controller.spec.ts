import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ReceptionistController } from './receptionist.controller';
import { ReceptionistService } from './receptionist.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';

describe('ReceptionistController (Integration)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;

    // Sample data
    const mockEnterpriseId = 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c';
    const mockAvatarId = 'd6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a';
    let createdReceptionistId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [ReceptionistController],
            providers: [ReceptionistService, PrismaService],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();

        prismaService = moduleFixture.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        // Cleanup: Delete test receptionist if created
        if (createdReceptionistId) {
            await prismaService.receptionist.delete({
                where: { id: createdReceptionistId },
            });
        }
        await app.close();
    });

    describe('GET /receptionists', () => {
        it('should return an array of receptionists', () => {
            return request(app.getHttpServer())
                .get('/receptionists')
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });
    });

    describe('POST /receptionists', () => {
        it('should create a new receptionist', () => {
            const createDto: CreateReceptionistDto = {
                name: 'Test Receptionist',
                avatarId: mockAvatarId,
                cellphone: '+56912345678',
                levelFormality: 7,
                levelDynamism: 6,
                enterpriseId: mockEnterpriseId,
                enterpriseInformation: 'Test enterprise info',
                clientInformation: 'Test client info',
                businessRestrictions: 'Test restrictions',
                anticipationMaxDays: 30,
                anticipationMinDays: 1,
            };

            return request(app.getHttpServer())
                .post('/receptionists')
                .send(createDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.name).toBe(createDto.name);
                    expect(res.body.cellphone).toBe(createDto.cellphone);
                    expect(res.body.levelFormality).toBe(
                        createDto.levelFormality,
                    );
                    createdReceptionistId = res.body.id; // Save for cleanup
                });
        });

        it('should return 400 for invalid data', () => {
            const invalidDto = {
                name: '', // Empty name (invalid)
                cellphone: 'invalid-phone',
            };

            return request(app.getHttpServer())
                .post('/receptionists')
                .send(invalidDto)
                .expect(400);
        });

        it('should return 404 when enterprise does not exist', () => {
            const createDto: CreateReceptionistDto = {
                name: 'Test Receptionist',
                avatarId: mockAvatarId,
                cellphone: '+56912345678',
                levelFormality: 7,
                levelDynamism: 6,
                enterpriseId: 'non-existent-id',
                enterpriseInformation: 'Test enterprise info',
                clientInformation: 'Test client info',
                businessRestrictions: 'Test restrictions',
                anticipationMaxDays: 30,
                anticipationMinDays: 1,
            };

            return request(app.getHttpServer())
                .post('/receptionists')
                .send(createDto)
                .expect(404)
                .expect((res) => {
                    expect(res.body.error).toBe('EnterpriseNotFound');
                });
        });
    });

    describe('GET /receptionists/:id', () => {
        it('should return a receptionist by id', async () => {
            // First, get any receptionist
            const receptionists = await prismaService.receptionist.findMany({
                take: 1,
            });

            if (receptionists.length > 0) {
                const id = receptionists[0].id;

                return request(app.getHttpServer())
                    .get(`/receptionists/${id}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.id).toBe(id);
                        expect(res.body).toHaveProperty('name');
                        expect(res.body).toHaveProperty('cellphone');
                    });
            }
        });

        it('should return 404 for non-existent receptionist', () => {
            return request(app.getHttpServer())
                .get('/receptionists/non-existent-id')
                .expect(404)
                .expect((res) => {
                    expect(res.body.error).toBe('ReceptionistNotFound');
                });
        });
    });

    describe('PATCH /receptionists/:id', () => {
        it('should update a receptionist', async () => {
            // Get a receptionist to update
            const receptionists = await prismaService.receptionist.findMany({
                take: 1,
            });

            if (receptionists.length > 0) {
                const id = receptionists[0].id;
                const updateData = {
                    name: 'Updated Name',
                    levelFormality: 9,
                };

                return request(app.getHttpServer())
                    .patch(`/receptionists/${id}`)
                    .send(updateData)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.name).toBe(updateData.name);
                        expect(res.body.levelFormality).toBe(
                            updateData.levelFormality,
                        );
                    });
            }
        });

        it('should return 404 when updating non-existent receptionist', () => {
            return request(app.getHttpServer())
                .patch('/receptionists/non-existent-id')
                .send({ name: 'Updated' })
                .expect(404);
        });
    });

    describe('DELETE /receptionists/:id', () => {
        it('should delete a receptionist', async () => {
            // Create a receptionist to delete
            const receptionist = await prismaService.receptionist.create({
                data: {
                    name: 'To Delete',
                    avatarId: mockAvatarId,
                    cellphone: '+56987654321',
                    levelFormality: 5,
                    levelDynamism: 5,
                    anticipationMaxDays: 30,
                    anticipationMinDays: 1,
                    enterpriseId: mockEnterpriseId,
                    enterpriseInformation: 'Test info',
                    clientInformation: 'Test client info',
                    businessRestrictions: 'Test restrictions',
                },
            });

            return request(app.getHttpServer())
                .delete(`/receptionists/${receptionist.id}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(receptionist.id);
                });
        });

        it('should return 404 when deleting non-existent receptionist', () => {
            return request(app.getHttpServer())
                .delete('/receptionists/non-existent-id')
                .expect(404);
        });

        it('should return 409 when receptionist has dependencies', async () => {
            // This test assumes you have a receptionist with metrics
            const receptionistWithMetrics =
                await prismaService.receptionist.findFirst({
                    where: {
                        metrics: {
                            some: {},
                        },
                    },
                });

            if (receptionistWithMetrics) {
                return request(app.getHttpServer())
                    .delete(`/receptionists/${receptionistWithMetrics.id}`)
                    .expect(409)
                    .expect((res) => {
                        expect(res.body.error).toBe(
                            'ReceptionistHasDependencies',
                        );
                    });
            }
        });
    });
});
