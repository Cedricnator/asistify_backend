export interface ReceptionistSession {
  receptionistId: string;
  receptionistName: string;
  session: any;
  personality: {
    formality: number;
    dynamism: number;
  };
}
