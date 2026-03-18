import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHospedagemDto {
  @Type(() => Number)
  @IsInt()
  idPacoteViagem: number;

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

  @IsString()
  @IsNotEmpty()
  regrasHospedagem: string;

  @IsString()
  @IsNotEmpty()
  statusReserva: string;
}
