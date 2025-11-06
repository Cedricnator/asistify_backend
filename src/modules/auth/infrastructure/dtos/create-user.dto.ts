import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'User email address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password for the new user',
    })
    @IsString()
    password: string;

    @ApiProperty({
        description: "User's display name",
    })
    @IsString()
    name: string;
}
