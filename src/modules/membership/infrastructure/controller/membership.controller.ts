import {Controller, Get, Inject, UseGuards} from "@nestjs/common";
import {ListAllUseCase} from "../../application/use-cases/list-all.use-case";
import {MembershipEntity} from "../../domain/entities/membership.entity";
import { Public } from "src/modules/auth/infrastructure/decorators/public.decorator";

@Controller('membership')
export class MembershipController {

    constructor(
        private readonly listAllMemberships: ListAllUseCase
    ) {}
    @Public()
    @Get()
    async findAll(): Promise<MembershipEntity[]> {
        return await this.listAllMemberships.execute()
    }
}