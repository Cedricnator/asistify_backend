export class CallHistory {
  constructor(
    public readonly date: Date,
    public readonly clientName: string,
    public readonly durationInSeconds: number,
    public readonly receptionistId: string,
    public readonly state: string,
  ) {}
}
