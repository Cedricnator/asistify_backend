export class ReceptionistEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly cellphone: string,
    public readonly levelFormality: number,
    public readonly levelDynamism: number,
    public readonly anticipationMaxDays: number,
    public readonly anticipationMinDays: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly enterpriseId: string,
    public readonly avatarId: string,
    public readonly enterpriseInformation?: string | null,
    public readonly clientInformation?: string | null,
    public readonly businessRestrictions?: string | null,
  ) {}
}

interface ReceptionistBuilder {
  withId(id: string): ReceptionistBuilder;
  withName(name: string): ReceptionistBuilder;
  withCellphone(cellphone: string): ReceptionistBuilder;
  withLevelFormality(levelFormality: number): ReceptionistBuilder;
  withLevelDynamism(levelDynamism: number): ReceptionistBuilder;
  withAnticipationMaxDays(anticipationMaxDays: number): ReceptionistBuilder;
  withAnticipationMinDays(anticipationMinDays: number): ReceptionistBuilder;
  withCreatedAt(createdAt: Date): ReceptionistBuilder;
  withUpdatedAt(updatedAt: Date): ReceptionistBuilder;
  withEnterpriseId(enterpriseId: string): ReceptionistBuilder;
  withAvatarId(avatarId: string): ReceptionistBuilder;
  withEnterpriseInformation(
    enterpriseInformation: string | null,
  ): ReceptionistBuilder;
  withClientInformation(clientInformation: string | null): ReceptionistBuilder;
  withBusinessRestrictions(
    businessRestrictions: string | null,
  ): ReceptionistBuilder;
  build(): ReceptionistEntity;
}

export class ConcreteReceptionistBuilder implements ReceptionistBuilder {
  private id?: string;
  private name?: string;
  private cellphone?: string;
  private levelFormality?: number;
  private levelDynamism?: number;
  private anticipationMaxDays?: number;
  private anticipationMinDays?: number;
  private createdAt?: Date;
  private updatedAt?: Date;
  private enterpriseId?: string;
  private avatarId?: string;
  private enterpriseInformation?: string | null;
  private clientInformation?: string | null;
  private businessRestrictions?: string | null;

  withId(id: string): ReceptionistBuilder {
    this.id = id;
    return this;
  }

  withName(name: string): ReceptionistBuilder {
    this.name = name;
    return this;
  }

  withCellphone(cellphone: string): ReceptionistBuilder {
    this.cellphone = cellphone;
    return this;
  }

  withLevelFormality(levelFormality: number): ReceptionistBuilder {
    this.levelFormality = levelFormality;
    return this;
  }

  withLevelDynamism(levelDynamism: number): ReceptionistBuilder {
    this.levelDynamism = levelDynamism;
    return this;
  }

  withAnticipationMaxDays(anticipationMaxDays: number): ReceptionistBuilder {
    this.anticipationMaxDays = anticipationMaxDays;
    return this;
  }

  withAnticipationMinDays(anticipationMinDays: number): ReceptionistBuilder {
    this.anticipationMinDays = anticipationMinDays;
    return this;
  }

  withCreatedAt(createdAt: Date): ReceptionistBuilder {
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): ReceptionistBuilder {
    this.updatedAt = updatedAt;
    return this;
  }

  withEnterpriseId(enterpriseId: string): ReceptionistBuilder {
    this.enterpriseId = enterpriseId;
    return this;
  }

  withAvatarId(avatarId: string): ReceptionistBuilder {
    this.avatarId = avatarId;
    return this;
  }

  withEnterpriseInformation(
    enterpriseInformation?: string | null,
  ): ReceptionistBuilder {
    this.enterpriseInformation = enterpriseInformation;
    return this;
  }

  withClientInformation(
    clientInformation?: string | null,
  ): ReceptionistBuilder {
    this.clientInformation = clientInformation;
    return this;
  }

  withBusinessRestrictions(
    businessRestrictions?: string | null,
  ): ReceptionistBuilder {
    this.businessRestrictions = businessRestrictions;
    return this;
  }

  build(): ReceptionistEntity {
    if (!this.id) throw new Error('id is required');
    if (!this.name) throw new Error('name is required');
    if (!this.cellphone) throw new Error('cellphone is required');
    if (this.levelFormality === undefined)
      throw new Error('levelFormality is required');
    if (this.levelDynamism === undefined)
      throw new Error('levelDynamism is required');
    if (this.anticipationMaxDays === undefined)
      throw new Error('anticipationMaxDays is required');
    if (this.anticipationMinDays === undefined)
      throw new Error('anticipationMinDays is required');
    if (!this.createdAt) throw new Error('createdAt is required');
    if (!this.updatedAt) throw new Error('updatedAt is required');
    if (!this.enterpriseId) throw new Error('enterpriseId is required');
    if (!this.avatarId) throw new Error('avatarId is required');

    return new ReceptionistEntity(
      this.id,
      this.name,
      this.cellphone,
      this.levelFormality,
      this.levelDynamism,
      this.anticipationMaxDays,
      this.anticipationMinDays,
      this.createdAt,
      this.updatedAt,
      this.enterpriseId,
      this.avatarId,
      this.enterpriseInformation,
      this.clientInformation,
      this.businessRestrictions,
    );
  }
}
