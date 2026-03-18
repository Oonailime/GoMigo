import { Body, Controller, Param, Post } from '@nestjs/common';
import { AceitarSolicitacaoDto } from './dto/aceitar-solicitacao.dto';
import { RejeitarSolicitacaoDto } from './dto/rejeitar-solicitacao.dto';
import { SolicitarParticipacaoDto } from './dto/solicitar-participacao.dto';
import { SolicitacoesService } from './solicitacoes.service';

@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @Post('/pacote/:idPacoteViagem')
  solicitar(
    @Param('idPacoteViagem') idPacoteViagem: string,
    @Body() body: SolicitarParticipacaoDto,
  ) {
    return this.solicitacoesService.solicitarParticipacao(Number(idPacoteViagem), body);
  }

  @Post(':id/aceitar')
  aceitar(
    @Param('id') id: string,
    @Body() body: AceitarSolicitacaoDto,
  ) {
    return this.solicitacoesService.aceitarSolicitacao(Number(id), body.idUserOrganizador);
  }

  @Post(':id/rejeitar')
  rejeitar(
    @Param('id') id: string,
    @Body() body: RejeitarSolicitacaoDto,
  ) {
    return this.solicitacoesService.rejeitarSolicitacao(Number(id), body.idUserOrganizador, body.motivoRecusa);
  }
}
