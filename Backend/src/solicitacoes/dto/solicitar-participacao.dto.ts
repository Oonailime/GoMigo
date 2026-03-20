import { IsOptional, IsString } from 'class-validator';

export class SolicitarParticipacaoDto {
  @IsOptional()
  @IsString()
  mensagemSolicitacao?: string;
}
