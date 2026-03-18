import { IsIn, IsInt, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CriarAvaliacaoDto {
  @IsIn(['PACOTE', 'ORGANIZADOR', 'VIAJANTE'])
  tipo: 'PACOTE' | 'ORGANIZADOR' | 'VIAJANTE';

  @Type(() => Number)
  @IsInt()
  idUserAutor: number;

  @Type(() => Number)
  @IsInt()
  idPacoteViagem: number;

  @ValidateIf((o) => o.tipo !== 'PACOTE')
  @Type(() => Number)
  @IsInt()
  idUserAvaliado?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  nota: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}
