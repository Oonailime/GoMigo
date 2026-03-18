import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CriarAvaliacaoDto {
  @IsIn(['PACOTE', 'ORGANIZADOR', 'VIAJANTE'])
  tipo: 'PACOTE' | 'ORGANIZADOR' | 'VIAJANTE';

  @Type(() => Number)
  @IsInt()
  idUserAutor: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPacoteViagem?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idUserAvaliado?: number;

  @Type(() => Number)
  @IsInt()
  nota: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}
