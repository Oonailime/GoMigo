import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCaronaDto {
  @Type(() => Number)
  @IsInt()
  idPacoteViagem: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idVeiculo?: number;

  @Type(() => Number)
  @IsInt()
  idMotorista: number;

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

  @IsString()
  @IsNotEmpty()
  regrasCarona: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vagasDisponiveis?: number;

  @IsString()
  @IsNotEmpty()
  status: string;
}
