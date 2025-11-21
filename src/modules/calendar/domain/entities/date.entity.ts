export class DateEntity {
    constructor(
        public readonly calendarId:string,
        public readonly eventId: string,
        public readonly name: string,
        public readonly startDatetime: Date,
        public readonly endDatetime: Date,
        public readonly timezone:string
        
    ) {}
}