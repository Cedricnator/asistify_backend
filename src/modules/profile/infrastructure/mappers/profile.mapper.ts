import { Profile } from '@prisma/client';
import { ProfileEntity } from '../../domain/entities/profile.entity';
import { CreateProfileWithUserIdCommand } from '../../domain/commands/create-profile-with-user-id.command';

interface CreateProfileData {
  name: string;
  email: string;
  user_id: string;
  phone_number: string;
  role_id: string;
  avatar?: string;
}

export class ProfileMapper {
  static toDomain(raw: Profile): ProfileEntity {
    return new ProfileEntity(
      raw.id,
      raw.name,
      raw.email,
      raw.created_at,
      raw.updated_at,
      raw.role_id,
      raw.phone_number,
      raw.avatar,
    );
  }

  static toCreate(params: CreateProfileWithUserIdCommand): CreateProfileData {
    return {
      name: params.name,
      email: params.email,
      user_id: params.userId,
      avatar: params.avatar,
      phone_number: params.phoneNumber,
      role_id: params.roleId,
    };
  }

  static toUpdate(entity: ProfileEntity): Partial<Profile> {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      phone_number: entity.phoneNumber,
      role_id: entity.roleId,
      avatar: entity.avatar,
      updated_at: new Date(),
    };
  }

  static toDomainList(rawList: Profile[]): ProfileEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }
}
