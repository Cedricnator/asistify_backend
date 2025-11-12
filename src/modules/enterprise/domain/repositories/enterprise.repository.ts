import { CreateEnterpriseCommand } from '../commands/create-enterprise.command';
import { UpdateEnterpriseCommand } from '../commands/update-enterprise.command';
import { EnterpriseEntity } from '../entities/enterprise.entity';

export const ENTERPRISE_REPOSITORY = Symbol('ENTERPRISE_REPOSITORY');

export interface EnterpriseRepository {
  create(params: CreateEnterpriseCommand): Promise<EnterpriseEntity>;
  findAll(): Promise<EnterpriseEntity[]>;
  findById(id: string): Promise<EnterpriseEntity | null>;
  findByName(name: string): Promise<EnterpriseEntity | null>;
  update(params: UpdateEnterpriseCommand): Promise<EnterpriseEntity>;
  delete(id: string): Promise<void>;
}
