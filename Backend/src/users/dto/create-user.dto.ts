import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
