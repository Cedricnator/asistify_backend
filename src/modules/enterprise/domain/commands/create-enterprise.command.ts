export interface CreateEnterpriseCommand {
  name: string;
  categoryId: string;
  calendarId: string;
  subscriptionId?: string;
}
