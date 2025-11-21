export interface CreateDateCommand {
    calendarId:string,
    name:string,
    startDatetime:Date,
    endDatetime:Date,
    timezone:string|undefined
}
