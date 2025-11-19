export class CalendarMetric {
  constructor(
    public readonly date: Date,
    public readonly scheduledCount: number,
    public readonly confirmedCount: number,
    public readonly toConfirmCount: number,
  ) {}
}
