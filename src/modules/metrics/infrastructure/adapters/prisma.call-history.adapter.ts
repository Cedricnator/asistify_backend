import { Injectable } from '@nestjs/common';
import { CallHistoryPort } from '../../domain/ports/out/call-history.port';
import { CallHistory } from '../../domain/entities/call-history.entity';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrismaCallHistoryAdapter implements CallHistoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(idEnterprise: string): Promise<CallHistory[]> {
    const history = await this.prisma.callHistory.findMany({
      where: {
        receptionist: {
          enterpriseId: idEnterprise,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return history.map(h => new CallHistory(
        h.date,
        h.client_name,
        h.duration_seconds,
        h.receptionist_id,
        h.state
    ));
  }

  async save(callHistory: CallHistory): Promise<void> {
    await this.prisma.callHistory.create({
      data: {
        date: callHistory.date,
        client_name: callHistory.clientName,
        duration_seconds: callHistory.durationInSeconds,
        receptionist_id: callHistory.receptionistId,
        state: callHistory.state,
      },
    });
  }
}
