import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

const tiposPacote = [
  'ROTEIRO_COMPLETO',
  'COMPARTILHADO',
  'BATE_VOLTA',
  'APENAS_CARONA',
  'APENAS_HOSPEDAGEM',
  'APENAS_GUIA_TURISTICO',
] as const;

export class CreatePacoteDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idOrganizador: number;

  @Type(() => Number)
  @IsInt()
  idEnderecoPartida: number;

  @Type(() => Number)
  @IsInt()
  idEnderecoDestino: number;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsIn(tiposPacote)
  tipoPacoteViagem: (typeof tiposPacote)[number];

  @IsString()
  @IsNotEmpty()
  status: string;

  @Type(() => Number)
  @IsInt()
  vagas: number;

  @IsString()
  @IsNotEmpty()
  regrasViagem: string;

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

  @IsString()
  @IsNotEmpty()
  privacidade: string;
}
