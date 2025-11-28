export interface CalendarEvent {
  id: string;
  title: string;
  start?: string;
  end?: string;
}

export interface Calendar {
  id: string;
  summary: string;
  dates: CalendarEvent[];
}

export interface CalendarRepositoryPort {
  findAllForUser?(userId: string): Promise<Calendar[]>;
  findAll?(): Promise<Calendar[]>;
  listForUser?(userId: string): Promise<Calendar[]>;
  findById?(id: string): Promise<Calendar | null>;
  getById?(id: string): Promise<Calendar | null>;
  save?(c: Calendar): Promise<void>;
  remove?(id: string): Promise<void>;
}

export interface AuthStrategy {
  validate?(payload: any): Promise<any> | any;
  authenticate?(req: any, options?: any): any;
}

