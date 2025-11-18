export class CallHistory {
  constructor(
    public readonly date: Date,
    public readonly clientName: number,
    public readonly durationInMinutes: number,
    public readonly receptionistId: string,
    public readonly state: string,
  ) {}
}
