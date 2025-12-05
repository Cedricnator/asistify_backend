import { MembershipEntity } from '../entities/membership.entity';

export const MEMBERSHIP_REPOSITORY = Symbol('MEMBERSHIP_REPOSITORY');

export interface MembershipRepository {
  createMembership(
    name: string,
    description: string,
    price: number,
    functionalities: string[],
  ): Promise<MembershipEntity>;
  listMemberships(): Promise<MembershipEntity[]>;
  updateMembership(
    id: string,
    updates: Partial<{ membership: MembershipEntity }>,
  ): Promise<MembershipEntity>;
  deleteMembership(id: string): Promise<void>;
}
