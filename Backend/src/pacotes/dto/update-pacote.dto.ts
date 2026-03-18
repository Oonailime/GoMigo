import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsString()
  tipoPacoteViagem?: string;

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
