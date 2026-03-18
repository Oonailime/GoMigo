import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnuncioDto {
  @Type(() => Number)
  @IsInt()
  idPacoteViagem: number;

  @Type(() => Number)
  @IsInt()
  idOrganizador: number;

  @IsString()
  @IsNotEmpty()
  tituloAnuncio: string;

  @IsOptional()
  @IsString()
  descricaoAnuncio?: string;

  @IsString()
  @IsNotEmpty()
  statusAnuncio: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orcamento?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataInicio?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataFim?: Date;
}
