import { ProfileEntity } from '../entities/profile.entity';

export interface ProfileBuilder {
  setId(id: string): ProfileBuilder;
  setName(name: string): ProfileBuilder;
  setEmail(email: string): ProfileBuilder;
  setCreatedAt(createdAt: Date): ProfileBuilder;
  setUpdatedAt(updatedAt: Date): ProfileBuilder;
  setRoleId(roleId: string): ProfileBuilder;
  setPhoneNumber(phoneNumber: string | null): ProfileBuilder;
  setAvatar(avatar: string | null): ProfileBuilder;
  build(): ProfileEntity;
}

export class ConcreteProfileBuilder implements ProfileBuilder {
  private id: string;
  private name: string;
  private email: string;
  private createdAt: Date;
  private updatedAt: Date;
  private roleId: string;
  private phoneNumber?: string | null;
  private avatar?: string | null;

  setId(id: string): ProfileBuilder {
    if (id.trim() === '') {
      throw new Error('ID no puede estar vacío');
    }
    this.id = id;
    return this;
  }

  setName(name: string): ProfileBuilder {
    if (name.trim() === '') {
      throw new Error('Name no puede estar vacío');
    }
    this.name = name;
    return this;
  }

  setEmail(email: string): ProfileBuilder {
    if (email.trim() === '') {
      throw new Error('Email no puede estar vacío');
    }
    this.email = email;
    return this;
  }

  setCreatedAt(createdAt: Date): ProfileBuilder {
    if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
      throw new Error('CreatedAt debe ser una fecha válida');
    }
    this.createdAt = createdAt;
    return this;
  }

  setUpdatedAt(updatedAt: Date): ProfileBuilder {
    if (!(updatedAt instanceof Date) || isNaN(updatedAt.getTime())) {
      throw new Error('UpdatedAt debe ser una fecha válida');
    }
    this.updatedAt = updatedAt;
    return this;
  }

  setRoleId(roleId: string): ProfileBuilder {
    if (roleId.trim() === '') {
      throw new Error('RoleId no puede estar vacío');
    }
    this.roleId = roleId;
    return this;
  }

  setPhoneNumber(phoneNumber: string | null): ProfileBuilder {
    this.phoneNumber = phoneNumber;
    return this;
  }

  setAvatar(avatar: string | null): ProfileBuilder {
    this.avatar = avatar;
    return this;
  }

  build(): ProfileEntity {
    return new ProfileEntity(
      this.id,
      this.name,
      this.email,
      this.createdAt,
      this.updatedAt,
      this.roleId,
      this.phoneNumber,
      this.avatar,
    );
  }
}
