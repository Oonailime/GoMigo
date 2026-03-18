import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVeiculoDto {
  @Type(() => Number)
  @IsInt()
  idUserProprietario: number;

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsOptional()
  @IsString()
  cor?: string;

  @IsString()
  @IsNotEmpty()
  placa: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ano?: number;

  @Type(() => Number)
  @IsInt()
  capacidadePassageiros: number;
}
