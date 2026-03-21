import { Body, Controller, Get, Param, Post, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AceitarSolicitacaoDto } from './dto/aceitar-solicitacao.dto';
import { RejeitarSolicitacaoDto } from './dto/rejeitar-solicitacao.dto';
import { SolicitarParticipacaoDto } from './dto/solicitar-participacao.dto';
import { SolicitacoesService } from './solicitacoes.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/pacote/:idPacoteViagem')
  solicitar(
    @Param('idPacoteViagem', ParseIntPipe) idPacoteViagem: number,
    @Req() req: { user: { sub: number | null } },
    @Body() body: SolicitarParticipacaoDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.solicitacoesService.solicitarParticipacao(idPacoteViagem, req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/aceitar')
  aceitar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
    @Body() _body: AceitarSolicitacaoDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.solicitacoesService.aceitarSolicitacao(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/rejeitar')
  rejeitar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
    @Body() body: RejeitarSolicitacaoDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.solicitacoesService.rejeitarSolicitacao(id, req.user.sub, body.motivoRecusa);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pacote/:idPacoteViagem')
  findByPacote(
    @Param('idPacoteViagem', ParseIntPipe) idPacoteViagem: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.solicitacoesService.findByPacote(idPacoteViagem, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('minhas')
  findMine(@Req() req: { user: { sub: number | null } }) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.solicitacoesService.findMine(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notificacoes')
  getNotifications(@Req() req: { user: { sub: number | null } }) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.solicitacoesService.getNotifications(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.solicitacoesService.findOneForUser(id, req.user.sub);
  }
}
