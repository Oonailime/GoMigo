import { IsDate, IsIn, IsNotEmpty, IsString } from 'class-validator';
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
  @IsString()
  @IsNotEmpty()
  cidadePartida: string;

  @IsString()
  @IsNotEmpty()
  cidadeDestino: string;

  @IsIn(tiposPacote)
  tipo: (typeof tiposPacote)[number];

  @Type(() => Date)
  @IsDate()
  dataInicio: Date;

  @Type(() => Date)
  @IsDate()
  dataFim: Date;
}
