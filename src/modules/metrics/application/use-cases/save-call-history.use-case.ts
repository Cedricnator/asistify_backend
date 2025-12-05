import { Inject, Injectable } from '@nestjs/common';
import { CALL_HISTORY, type CallHistoryPort } from '../../domain/ports/out/call-history.port';
import { CallHistory } from '../../domain/entities/call-history.entity';
import { CreateCallHistoryDto } from '../../infrastructure/dtos/create-call-history.dto';

@Injectable()
export class SaveCallHistoryUseCase {
  constructor(
    @Inject(CALL_HISTORY)
    private readonly callHistoryPort: CallHistoryPort,
  ) {}

  async execute(dto: CreateCallHistoryDto): Promise<void> {
    const callHistory = new CallHistory(
      dto.date,
      dto.clientName,
      dto.durationInSeconds,
      dto.receptionistId,
      dto.state,
    );
    await this.callHistoryPort.save(callHistory);
  }
}
