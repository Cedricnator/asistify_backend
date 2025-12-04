import { CallHistory } from '../../entities/call-history.entity';

export const CALL_HISTORY = 'CALL_HISTORY';

export interface CallHistoryPort {
  getHistory(idEnterprise: string): Promise<CallHistory[]>;
  save(callHistory: CallHistory): Promise<void>;
}
