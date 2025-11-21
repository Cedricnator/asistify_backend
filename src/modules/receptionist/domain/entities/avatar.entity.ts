export class AvatarEntity {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

interface AvatarBuilder {
  withId(id: string): AvatarBuilder;
  withUrl(url: string): AvatarBuilder;
  withCreatedAt(createdAt: Date): AvatarBuilder;
  withUpdatedAt(updatedAt: Date): AvatarBuilder;
  build(): AvatarEntity;
}

export class ConcreteAvatarBuilder implements AvatarBuilder {
  private id: string;
  private url: string;
  private createdAt: Date;
  private updatedAt: Date;

  withId(id: string): AvatarBuilder {
    if (!id) {
      throw new Error('ID cannot be empty');
    }
    this.id = id;
    return this;
  }

  withUrl(url: string): AvatarBuilder {
    if (!url) {
      throw new Error('URL cannot be empty');
    }
    this.url = url;
    return this;
  }

  withCreatedAt(createdAt: Date): AvatarBuilder {
    if (!createdAt) {
      throw new Error('CreatedAt cannot be empty');
    }
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): AvatarBuilder {
    if (!updatedAt) {
      throw new Error('UpdatedAt cannot be empty');
    }
    this.updatedAt = updatedAt;
    return this;
  }

  build(): AvatarEntity {
    return new AvatarEntity(this.id, this.url, this.createdAt, this.updatedAt);
  }
}
