export class CalendarMetric {
  constructor(
    public readonly date: Date,
    /** Total number of available events in the calendar */
    public readonly availableCount: number,
    /** Number of events that have been confirmed */
    public readonly confirmedCount: number,
    /** Number of events that are pending confirmation state */
    public readonly toConfirmCount: number,
  ) {}
}
