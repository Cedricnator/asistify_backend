import { Inject, Injectable } from '@nestjs/common';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import { MEMBERSHIP_REPOSITORY } from '../../domain/repositories/membership.repository';
import { MembershipEntity } from '../../domain/entities/membership.entity';
import { CreateMembershipDto } from '../../infrastructure/dto/create-membership.dto';

@Injectable()
export class CreateMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly repository: MembershipRepository,
  ) {}

  async execute(input: CreateMembershipDto): Promise<MembershipEntity> {
    const { name, description, price, functionalities } = input;
    return await this.repository.createMembership(
      name,
      description,
      price,
      functionalities,
    );
  }
}
