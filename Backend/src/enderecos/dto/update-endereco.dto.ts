import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEnderecoDto {
  @IsOptional()
  @IsString()
  rua?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  numero?: number;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  cidade?: string;
}
