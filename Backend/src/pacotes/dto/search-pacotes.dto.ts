import { IsDate, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

const tiposPacote = [
  'ROTEIRO_COMPLETO',
  'COMPARTILHADO',
  'BATE_VOLTA',
  'APENAS_CARONA',
  'APENAS_HOSPEDAGEM',
  'APENAS_GUIA_TURISTICO',
] as const;

export class SearchPacotesDto {
  @IsOptional()
  @IsString()
  cidadePartida?: string;

  @IsOptional()
  @IsString()
  cidadeDestino?: string;

  @IsOptional()
  @IsIn(tiposPacote)
  tipo?: (typeof tiposPacote)[number];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataInicio?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataFim?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
