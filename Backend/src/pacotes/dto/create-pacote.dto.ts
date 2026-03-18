import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePacoteDto {
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

  @IsString()
  @IsNotEmpty()
  tipoPacoteViagem: string;

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
