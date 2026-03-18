import { IsOptional, IsString, Matches } from 'class-validator';

export class CompleteProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'cpf deve conter 11 digitos numericos',
  })
  cpf: string;

  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'phoneNumber deve conter 10 ou 11 digitos numericos',
  })
  phoneNumber: string;
}
