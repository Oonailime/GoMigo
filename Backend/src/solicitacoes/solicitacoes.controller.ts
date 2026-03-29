import { Body, Controller, Get, Param, Post, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AceitarSolicitacaoDto } from './dto/aceitar-solicitacao.dto';
import { RejeitarSolicitacaoDto } from './dto/rejeitar-solicitacao.dto';
import { SolicitarParticipacaoDto } from './dto/solicitar-participacao.dto';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { SolicitacoesService } from './solicitacoes.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/pacote/:idPacoteViagem')
  solicitar(
    @Param('idPacoteViagem', ParseIntPipe) idPacoteViagem: number,
    @CurrentUserId() userId: number,
    @Body() body: SolicitarParticipacaoDto,
  ) {
    return this.solicitacoesService.solicitarParticipacao(idPacoteViagem, userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/aceitar')
  aceitar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
    @Body() _body: AceitarSolicitacaoDto,
  ) {
    return this.solicitacoesService.aceitarSolicitacao(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/rejeitar')
  rejeitar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
    @Body() body: RejeitarSolicitacaoDto,
  ) {
    return this.solicitacoesService.rejeitarSolicitacao(id, userId, body.motivoRecusa);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pacote/:idPacoteViagem')
  findByPacote(
    @Param('idPacoteViagem', ParseIntPipe) idPacoteViagem: number,
    @CurrentUserId() userId: number,
  ) {
    return this.solicitacoesService.findByPacote(idPacoteViagem, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('minhas')
  findMine(@CurrentUserId() userId: number) {
    return this.solicitacoesService.findMine(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notificacoes')
  getNotifications(@CurrentUserId() userId: number) {
    return this.solicitacoesService.getNotifications(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.solicitacoesService.findOneForUser(id, userId);
  }
}
