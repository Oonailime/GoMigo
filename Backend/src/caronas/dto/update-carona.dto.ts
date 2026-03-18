import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCaronaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idVeiculo?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataIda?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataVolta?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  precoTotal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  precoPorPessoa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idEnderecoPartida?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idEnderecoDestino?: number;

  @IsOptional()
  @IsString()
  regrasCarona?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vagasDisponiveis?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
