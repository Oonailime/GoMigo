import { IsDate, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

const tiposPacote = [
  'ROTEIRO_COMPLETO',
  'COMPARTILHADO',
  'BATE_VOLTA',
  'APENAS_CARONA',
  'APENAS_HOSPEDAGEM',
  'APENAS_GUIA_TURISTICO',
] as const;

export class UpdatePacoteDto {
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
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsIn(tiposPacote)
  tipoPacoteViagem?: (typeof tiposPacote)[number];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vagas?: number;

  @IsOptional()
  @IsString()
  regrasViagem?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  valorTotalPrevisto?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  valorPorPessoaPrevisto?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataInicio?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataFim?: Date;

  @IsOptional()
  @IsString()
  privacidade?: string;
}
