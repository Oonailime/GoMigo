import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SolicitarParticipacaoDto {
  @Type(() => Number)
  @IsInt()
  idUser: number;

  @IsOptional()
  @IsString()
  mensagemSolicitacao?: string;
}
