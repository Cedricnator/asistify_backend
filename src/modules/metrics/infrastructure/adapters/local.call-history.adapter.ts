import { CallHistoryPort } from '../../domain/ports/out/call-history.port';
import { CallHistory } from '../../domain/entities/call-history.entity';

export class LocalCallHistoryAdapter implements CallHistoryPort {
  async getHistory(idEnterprise: string) {
    const history = [
      new CallHistory(new Date(), 'Client A', 3, 'receptionist1', 'completed'),
      new CallHistory(new Date(), 'Client B', 0, 'receptionist2', 'missed'),
      new CallHistory(new Date(), 'Client C', 5, 'receptionist3', 'completed'),
      new CallHistory(
        new Date(1764719115),
        'Client A',
        4,
        'receptionist3',
        'completed',
      ),
    ];
    return history;
  }
  async save(callHistory: CallHistory) {
    // No operation needed for local adapter
  }
}
