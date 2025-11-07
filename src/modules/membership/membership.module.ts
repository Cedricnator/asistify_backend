import {Module} from "@nestjs/common";
import {MembershipController} from "./infrastructure/controller/membership.controller";
import {ListAllUseCase} from "./application/use-cases/list-all.use-case";
import {MEMBERSHIP_REPOSITORY} from "./domain/repositories/membership.repository";
import {MembershipRepositoryAdapter} from "./infrastructure/prisma/membership.repository.adapter";

@Module({
    controllers: [MembershipController],
    providers: [
        ListAllUseCase,
        {
            provide: MEMBERSHIP_REPOSITORY,
            useClass: MembershipRepositoryAdapter
        }
    ],
    exports: [ListAllUseCase]
})
export class MembershipModule {}