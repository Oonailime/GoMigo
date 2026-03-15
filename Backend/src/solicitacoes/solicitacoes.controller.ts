import { Body, Controller, Param, Post } from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service';

@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @Post('/pacote/:idPacoteViagem')
  solicitar(
    @Param('idPacoteViagem') idPacoteViagem: string,
    @Body() body: { idUser: number; mensagemSolicitacao?: string },
  ) {
    return this.solicitacoesService.solicitarParticipacao(Number(idPacoteViagem), body);
  }

  @Post(':id/aceitar')
  aceitar(
    @Param('id') id: string,
    @Body() body: { idUserOrganizador: number },
  ) {
    return this.solicitacoesService.aceitarSolicitacao(Number(id), body.idUserOrganizador);
  }

  @Post(':id/rejeitar')
  rejeitar(
    @Param('id') id: string,
    @Body() body: { idUserOrganizador: number; motivoRecusa?: string },
  ) {
    return this.solicitacoesService.rejeitarSolicitacao(Number(id), body.idUserOrganizador, body.motivoRecusa);
  }
}
