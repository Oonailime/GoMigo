import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAnuncioDto {
  @IsOptional()
  @IsString()
  tituloAnuncio?: string;

  @IsOptional()
  @IsString()
  descricaoAnuncio?: string;

  @IsOptional()
  @IsString()
  statusAnuncio?: string;

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
