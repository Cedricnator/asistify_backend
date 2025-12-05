import { Module } from '@nestjs/common';
import { AssistantManager } from './application/assistant/assistant-manager';
import { RECEPCIONIST_REPOSITORY } from './domain/repositories/recepcionist.repository';
import { ReceptionistPrismaRepository } from './infrastructure/prisma/recepcionist.prisma.repository';
import { AVATAR_REPOSITORY } from './domain/repositories/avatar.repository';
import { AvatarPrismaRepository } from './infrastructure/prisma/avatar.prisma.repository';
import { METRIC_REPOSITORY } from './domain/repositories/metric.repository';
import { ReceptionistController } from './infrastructure/controllers/recepcionist.controller';
import { AvatarController } from './infrastructure/controllers/avatar.controller';
import { MetricController } from './infrastructure/controllers/metric.controller';
import { InitializeVoiceAssistantUseCase } from './application/use-cases/recepcionist/initialize-voice-assistant.use-case';
import { VoiceAgent } from './application/assistant/agents/voice-agent';
import { CreateAvatarUseCase } from './application/use-cases/avatar/create-avatar.use-case';
import { FindAllAvatarsUseCase } from './application/use-cases/avatar/find-all-avatars.use-case';
import { FindAvatarByIdUseCase } from './application/use-cases/avatar/find-avatar-by-id.use-case';
import { UpdateAvatarUseCase } from './application/use-cases/avatar/update-avatar.use-case';
import { CreateMetricUseCase } from './application/use-cases/metric/create-metric.use-case';
import { FindAllMetricsUseCase } from './application/use-cases/metric/find-all-metrics.use-case';
import { FindMetricByIdUseCase } from './application/use-cases/metric/find-metric-by-id.use-case';
import { CreateReceptionistUseCase } from './application/use-cases/recepcionist/create-receptionist.use-case';
import { DeleteReceptionistUseCase } from './application/use-cases/recepcionist/delete-receptionist.use-case';
import { FindAllReceptionistsUseCase } from './application/use-cases/recepcionist/find-all-receptionists.use-case';
import { FindReceptionistByIdUseCase } from './application/use-cases/recepcionist/find-receptionist-by-id.use-case';
import { UpdateReceptionistUseCase } from './application/use-cases/recepcionist/update-receptionist.use-case';
import { CountReceptionistUseCase } from './application/use-cases/recepcionist/count-receptionist.use-case';
import { CalendarModule } from '../calendar/calendar.module';
import { EnterpriseModule } from '../enterprise/enterprise.module';
import { PaymentsModule } from '../payments/payments.module';
import { SUSCRIPTION_REPOSITORY } from '../payments/domain/repositories/suscription.repository';
import { SuscriptionRepositoryAdapter } from '../payments/infrastructure/prisma/suscription.repository.adapter';

@Module({
  imports: [CalendarModule, EnterpriseModule, PaymentsModule],
  providers: [
    VoiceAgent,
    AssistantManager,
    InitializeVoiceAssistantUseCase,
    CreateReceptionistUseCase,
    FindReceptionistByIdUseCase,
    FindAllReceptionistsUseCase,
    UpdateReceptionistUseCase,
    DeleteReceptionistUseCase,

    CreateAvatarUseCase,
    FindAvatarByIdUseCase,
    FindAllAvatarsUseCase,
    UpdateAvatarUseCase,

    CreateMetricUseCase,
    FindAllMetricsUseCase,
    FindMetricByIdUseCase,

    CountReceptionistUseCase,

    {
      provide: RECEPCIONIST_REPOSITORY,
      useClass: ReceptionistPrismaRepository,
    },
    {
      provide: AVATAR_REPOSITORY,
      useClass: AvatarPrismaRepository,
    },
    {
      provide: METRIC_REPOSITORY,
      useClass: ReceptionistPrismaRepository,
    },
    {
      provide:SUSCRIPTION_REPOSITORY,
      useClass:SuscriptionRepositoryAdapter
    }
  ],
  controllers: [ReceptionistController, AvatarController, MetricController],
  exports: [
    AssistantManager,
    InitializeVoiceAssistantUseCase,
    CountReceptionistUseCase,
    FindAllReceptionistsUseCase,
  ],
})
export class ReceptionistModule {}
