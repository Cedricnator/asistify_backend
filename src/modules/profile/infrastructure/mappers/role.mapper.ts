import { Role } from '@prisma/client';
import { RoleEntity } from '../../domain/entities/role.entity';

export class RoleMapper {
  static toDomain(entity: Role) {
    return new RoleEntity(
      entity.id,
      entity.name,
      entity.created_at,
      entity.updated_at,
      entity.description,
    );
  }

  static toDomainList(entities: Role[]) {
    return entities.map((e) => this.toDomain(e));
  }
}
