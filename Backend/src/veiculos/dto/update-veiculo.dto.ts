import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateVeiculoDto {
  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  cor?: string;

  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ano?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  capacidadePassageiros?: number;
}
