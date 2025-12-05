import { Inject, Injectable } from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';

@Injectable()
export class DeleteMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly repository: MembershipRepository,
  ) {}
  async execute(id: string): Promise<void> {
    return await this.repository.deleteMembership(id);
  }
}
