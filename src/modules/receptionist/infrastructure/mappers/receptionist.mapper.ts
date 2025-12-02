import { Receptionist, Avatar } from '@prisma/client';
import {
  ConcreteReceptionistBuilder,
  ReceptionistEntity,
} from '../../domain/entities/receptionist.entity';
import { CreateReceptionistCommand } from '../../domain/commands/create-recepcionist.command';
import { ConcreteAvatarBuilder } from '../../domain/entities/avatar.entity';

interface CreateRecepcionsitData {
  name: string;
  cellphone: string;
  enterpriseInformation?: string | null;
  clientInformation?: string | null;
  businessRestrictions?: string | null;
  levelFormality: number;
  levelDynamism: number;
  anticipationMaxDays: number;
  anticipationMinDays: number;
  enterpriseId: string;
  avatarId: string;
}

export class ReceptionistMapper {
  static toDomain(
    raw: Receptionist & { avatar?: Avatar | null },
  ): ReceptionistEntity {
    const builder = new ConcreteReceptionistBuilder()
      .withId(raw.id)
      .withName(raw.name)
      .withCellphone(raw.cellphone)
      .withLevelFormality(raw.levelFormality)
      .withLevelDynamism(raw.levelDynamism)
      .withAnticipationMaxDays(raw.anticipationMaxDays)
      .withAnticipationMinDays(raw.anticipationMinDays)
      .withCreatedAt(raw.createdAt)
      .withUpdatedAt(raw.updatedAt)
      .withEnterpriseId(raw.enterpriseId)
      .withAvatarId(raw.avatarId)
      .withEnterpriseInformation(raw.enterpriseInformation)
      .withClientInformation(raw.clientInformation)
      .withBusinessRestrictions(raw.businessRestrictions);

    if (raw.avatar) {
      builder.withAvatar(
        new ConcreteAvatarBuilder()
          .withId(raw.avatar.id)
          .withUrl(raw.avatar.url)
          .withCreatedAt(raw.avatar.createdAt)
          .withUpdatedAt(raw.avatar.updatedAt)
          .build(),
      );
    }

    return builder.build();
  }

  static toCreate(raw: CreateReceptionistCommand): CreateRecepcionsitData {
    return {
      name: raw.name,
      cellphone: raw.cellphone,
      enterpriseInformation: raw.enterpriseInformation,
      clientInformation: raw.clientInformation,
      businessRestrictions: raw.businessRestrictions,
      levelFormality: raw.levelFormality,
      levelDynamism: raw.levelDynamism,
      anticipationMaxDays: raw.anticipationMaxDays,
      anticipationMinDays: raw.anticipationMinDays,
      enterpriseId: raw.enterpriseId,
      avatarId: raw.avatarId,
    };
  }

  static toUpdate(
    raw: ReceptionistEntity,
  ): Omit<Partial<ReceptionistEntity>, 'avatar'> {
    return {
      id: raw.id,
      name: raw.name,
      cellphone: raw.cellphone,
      enterpriseInformation: raw.enterpriseInformation,
      clientInformation: raw.clientInformation,
      businessRestrictions: raw.businessRestrictions,
      levelFormality: raw.levelFormality,
      levelDynamism: raw.levelDynamism,
      anticipationMaxDays: raw.anticipationMaxDays,
      anticipationMinDays: raw.anticipationMinDays,
      avatarId: raw.avatarId,
    };
  }

  static toUpdateEntity(
    id: string,
    dto: Partial<CreateReceptionistCommand>,
    existing: ReceptionistEntity,
  ): ReceptionistEntity {
    return new ConcreteReceptionistBuilder()
      .withId(id)
      .withName(dto.name ?? existing.name)
      .withCellphone(dto.cellphone ?? existing.cellphone)
      .withLevelFormality(dto.levelFormality ?? existing.levelFormality)
      .withLevelDynamism(dto.levelDynamism ?? existing.levelDynamism)
      .withAnticipationMaxDays(
        dto.anticipationMaxDays ?? existing.anticipationMaxDays,
      )
      .withAnticipationMinDays(
        dto.anticipationMinDays ?? existing.anticipationMinDays,
      )
      .withCreatedAt(existing.createdAt)
      .withUpdatedAt(new Date())
      .withEnterpriseId(dto.enterpriseId ?? existing.enterpriseId)
      .withAvatarId(dto.avatarId ?? existing.avatarId)
      .withEnterpriseInformation(
        dto.enterpriseInformation !== undefined
          ? dto.enterpriseInformation
          : (existing.enterpriseInformation ?? null),
      )
      .withClientInformation(
        dto.clientInformation !== undefined
          ? dto.clientInformation
          : (existing.clientInformation ?? null),
      )
      .withBusinessRestrictions(
        dto.businessRestrictions !== undefined
          ? dto.businessRestrictions
          : (existing.businessRestrictions ?? null),
      )
      .build();
  }

  static toDomainList(rawList: Receptionist[]): ReceptionistEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }
}
