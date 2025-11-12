import { DateEntity } from "./date.entity";

export class CalendarEntity {
    constructor(
        public readonly id: string,
        public readonly summary:string,
        public readonly dates: DateEntity[]=[],
    ) {}
}