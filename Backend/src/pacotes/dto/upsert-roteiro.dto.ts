import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const categoriasAtividade = ['PASSEIO_TURISMO', 'ALIMENTACAO'] as const;

class ItineraryCaronaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  origem?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  destino?: string;

  @IsOptional()
  @IsDateString()
  dataIda?: string;

  @IsOptional()
  @IsDateString()
  dataVolta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  vagasDisponiveis?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  precoPorPessoa?: number;

  @IsOptional()
  @IsString()
  regrasCarona?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

class ItineraryHospedagemDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nomeLocal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  local?: string;

  @IsOptional()
  @IsDateString()
  dataCheckin?: string;

  @IsOptional()
  @IsDateString()
  dataCheckout?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  precoPorPessoa?: number;

  @IsOptional()
  @IsString()
  regrasHospedagem?: string;

  @IsOptional()
  @IsString()
  statusReserva?: string;
}

class ItineraryAtividadeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsIn(categoriasAtividade)
  categoria: (typeof categoriasAtividade)[number];

  @IsString()
  @MaxLength(120)
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsDateString()
  dataHoraInicio: string;

  @IsDateString()
  dataHoraFim: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  preco?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  local?: string;
}

export class UpsertRoteiroDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ItineraryCaronaDto)
  caronas?: ItineraryCaronaDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ItineraryHospedagemDto)
  hospedagens?: ItineraryHospedagemDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ItineraryAtividadeDto)
  atividades?: ItineraryAtividadeDto[];
}
