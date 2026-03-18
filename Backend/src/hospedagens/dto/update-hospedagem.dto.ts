import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateHospedagemDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idEndereco?: number;

  @IsOptional()
  @IsString()
  nomeLocal?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataCheckin?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataCheckout?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  precoTotal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  precoPorPessoa?: number;

  @IsOptional()
  @IsString()
  regrasHospedagem?: string;

  @IsOptional()
  @IsString()
  statusReserva?: string;
}
