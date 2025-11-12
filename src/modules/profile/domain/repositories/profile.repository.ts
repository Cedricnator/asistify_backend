import { CreateProfileWithUserIdCommand } from '../commands/create-profile-with-user-id.command';
import { ProfileEntity } from '../entities/profile.entity';

export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');

export interface ProfileRepository {
  create(params: CreateProfileWithUserIdCommand): Promise<ProfileEntity>;
  findByEmail(email: string): Promise<ProfileEntity | null>;
  findById(id: string): Promise<ProfileEntity | null>;
  update(params: ProfileEntity): Promise<ProfileEntity>;
}
