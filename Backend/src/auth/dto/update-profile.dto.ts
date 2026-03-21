import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'cpf deve conter 11 digitos numericos',
  })
  cpf?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'phoneNumber deve conter 10 ou 11 digitos numericos',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  sobreMim?: string;

  @IsOptional()
  @IsString()
  personalidade?: string;

  @IsOptional()
  @IsString()
  experienciaViagem?: string;

  @IsOptional()
  @IsString()
  gostaDeFazer?: string;
}
