import { Body, Controller, Get, Param, Post, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AceitarSolicitacaoDto } from './dto/aceitar-solicitacao.dto';
import { RejeitarSolicitacaoDto } from './dto/rejeitar-solicitacao.dto';
import { SolicitarParticipacaoDto } from './dto/solicitar-participacao.dto';
import { SolicitacoesService } from './solicitacoes.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitacoesService.findOne(id);
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
}
