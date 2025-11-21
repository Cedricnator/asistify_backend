export interface UpdateDateCommand {
    calendarId:string,
    eventId:string,
    name:string,
    startDatetime:Date,
    endDatetime:Date,
    timezone:string|undefined
}
