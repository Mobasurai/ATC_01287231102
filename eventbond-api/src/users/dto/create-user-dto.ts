import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsStrongPassword()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    role: string;
}