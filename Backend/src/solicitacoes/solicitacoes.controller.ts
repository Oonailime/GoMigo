import { Body, Controller, Get, Param, Post, ParseIntPipe } from '@nestjs/common';
import { AceitarSolicitacaoDto } from './dto/aceitar-solicitacao.dto';
import { RejeitarSolicitacaoDto } from './dto/rejeitar-solicitacao.dto';
import { SolicitarParticipacaoDto } from './dto/solicitar-participacao.dto';
import { SolicitacoesService } from './solicitacoes.service';

@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @Post('/pacote/:idPacoteViagem')
  solicitar(
    @Param('idPacoteViagem', ParseIntPipe) idPacoteViagem: number,
    @Body() body: SolicitarParticipacaoDto,
  ) {
    return this.solicitacoesService.solicitarParticipacao(idPacoteViagem, body);
  }

  @Post(':id/aceitar')
  aceitar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AceitarSolicitacaoDto,
  ) {
    return this.solicitacoesService.aceitarSolicitacao(id, body.idUserOrganizador);
  }

  @Post(':id/rejeitar')
  rejeitar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RejeitarSolicitacaoDto,
  ) {
    return this.solicitacoesService.rejeitarSolicitacao(id, body.idUserOrganizador, body.motivoRecusa);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitacoesService.findOne(id);
  }

  @Get('/pacote/:idPacoteViagem')
  findByPacote(@Param('idPacoteViagem', ParseIntPipe) idPacoteViagem: number) {
    return this.solicitacoesService.findByPacote(idPacoteViagem);
  }
}
