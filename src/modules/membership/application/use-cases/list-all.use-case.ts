import { Inject, Injectable } from '@nestjs/common';
import {MEMBERSHIP_REPOSITORY} from "../../domain/repositories/membership.repository";
import type {MembershipRepository} from "../../domain/repositories/membership.repository";
import {MembershipEntity} from "../../domain/entities/membership.entity";

@Injectable()
export class ListAllUseCase {
    constructor(
        @Inject(MEMBERSHIP_REPOSITORY)
        private readonly repository: MembershipRepository,
    ) {}

    async execute(): Promise<MembershipEntity[]> {
        return await this.repository.listMemberships();
    }
}
