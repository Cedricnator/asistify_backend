import { Inject, Injectable } from '@nestjs/common';
import { CreateCalendarUseCase } from 'src/modules/calendar/application/use-cases/create-calendar.use-case';
import { EnterpriseEntity } from 'src/modules/enterprise/domain/entities/enterprise.entity';
import {
  ENTERPRISE_REPOSITORY,
  type EnterpriseRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise.repository';

@Injectable()
export class CreateEnterpriseUseCase {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly repo: EnterpriseRepository,
    private readonly createCalendarUseCase: CreateCalendarUseCase,
  ) {}

  async execute(params: {
    name: string;
    categoryId: string;
    subscriptionId?: string;
  }): Promise<EnterpriseEntity> {
    const calendar = await this.createCalendarUseCase.execute({
      summary: params.name,
    });
    const enterprise = await this.repo.create({
      name: params.name,
      categoryId: params.categoryId,
      calendarId: calendar.id,
      subscriptionId: params.subscriptionId,
    });
    return enterprise;
  }
}
