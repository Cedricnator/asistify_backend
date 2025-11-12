import { PartialType } from '@nestjs/mapped-types';
import { CreateReceptionistDto } from './create-receptionist.dto';

export class EditReceptionistDto extends PartialType(CreateReceptionistDto) {}
