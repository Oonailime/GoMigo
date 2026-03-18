import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnderecoDto {
  @IsString()
  @IsNotEmpty()
  rua: string;

  @IsString()
  @IsNotEmpty()
  cep: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  numero?: number;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsString()
  @IsNotEmpty()
  estado: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;
}
