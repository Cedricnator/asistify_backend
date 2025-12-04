import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateCallHistoryDto {
  @IsDate()
  date: Date;

  @IsString()
  clientName: string;

  @IsNumber()
  durationInSeconds: number;

  @IsString()
  receptionistId: string;

  @IsString()
  state: string;
}
