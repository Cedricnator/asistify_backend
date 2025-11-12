export interface CreateMetricCommand {
  modelUsed: string;
  tokenUsage: number;
  responseTimeMs: number;
  receptionistId: string;
}
