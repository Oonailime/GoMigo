import { Body, Controller, Get, Param, Post, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CriarAvaliacaoDto } from './dto/criar-avaliacao.dto';
import { AvaliacoesService } from './avaliacoes.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  criar(
    @Body() body: CriarAvaliacaoDto,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.avaliacoesService.criar({
      ...body,
      idUserAutor: req.user.sub,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('pendentes/:idPacoteViagem')
  listarPendentes(
    @Param('idPacoteViagem', ParseIntPipe) idPacoteViagem: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.avaliacoesService.listarPendentes(idPacoteViagem, req.user.sub);
  }
}
