import { Avatar } from '@prisma/client';
import {
  AvatarEntity,
  ConcreteAvatarBuilder,
} from '../../domain/entities/avatar.entity';
import { CreateAvatarCommand } from '../../domain/commands/create-avatar.command';

export class AvatarMapper {
  static toDomain(raw: Avatar): AvatarEntity {
    return new ConcreteAvatarBuilder()
      .withId(raw.id)
      .withUrl(raw.url)
      .withCreatedAt(raw.createdAt)
      .withUpdatedAt(raw.updatedAt)
      .build();
  }

  static toCreate(params: CreateAvatarCommand): { url: string } {
    return {
      url: params.url,
    };
  }

  static toUpdate(entity: AvatarEntity): Partial<AvatarEntity> {
    return {
      id: entity.id,
      url: entity.url,
      updatedAt: new Date(),
    };
  }

  static toUpdateEntity(
    id: string,
    dto: Partial<CreateAvatarCommand>,
    existing: AvatarEntity,
  ): AvatarEntity {
    return new ConcreteAvatarBuilder()
      .withId(id)
      .withUrl(dto.url ?? existing.url)
      .withCreatedAt(existing.createdAt)
      .withUpdatedAt(new Date())
      .build();
  }

  static toList(rawList: Avatar[]): AvatarEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }
}
