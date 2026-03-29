import { Body, Controller, Get, Param, Post, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CriarAvaliacaoDto } from './dto/criar-avaliacao.dto';
import { AvaliacoesService } from './avaliacoes.service';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  criar(
    @Body() body: CriarAvaliacaoDto,
    @CurrentUserId() userId: number,
  ) {
    return this.avaliacoesService.criar({
      ...body,
      idUserAutor: userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('pendentes/:idPacoteViagem')
  listarPendentes(
    @Param('idPacoteViagem', ParseIntPipe) idPacoteViagem: number,
    @CurrentUserId() userId: number,
  ) {
    return this.avaliacoesService.listarPendentes(idPacoteViagem, userId);
  }
}
