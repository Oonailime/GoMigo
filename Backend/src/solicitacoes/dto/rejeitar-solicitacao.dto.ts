import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class RejeitarSolicitacaoDto {
  @Type(() => Number)
  @IsInt()
  idUserOrganizador: number;

  @IsOptional()
  @IsString()
  motivoRecusa?: string;
}
