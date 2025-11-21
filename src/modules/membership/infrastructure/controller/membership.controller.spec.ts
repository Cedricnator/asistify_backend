import { Test, TestingModule } from '@nestjs/testing';
import { MembershipController } from './membership.controller';
import { MembershipModule } from '../../membership.module';
import { PrismaService } from '../../../prisma/prisma.service';

describe('MembershipController', () => {
    let controller: MembershipController;

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [MembershipModule],
        })
            .overrideProvider(PrismaService)
            .useValue({
                membership: {
                    findMany: jest.fn().mockResolvedValue([]),
                },
            })
            .compile();

        controller = moduleRef.get<MembershipController>(MembershipController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
