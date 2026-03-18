import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CriarAvaliacaoDto } from './dto/criar-avaliacao.dto';
import { AvaliacoesService } from './avaliacoes.service';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  criar(@Body() body: CriarAvaliacaoDto) {
    return this.avaliacoesService.criar(body);
  }

  @Get('pendentes/:idPacoteViagem/:idUserAutor')
  listarPendentes(
    @Param('idPacoteViagem') idPacoteViagem: string,
    @Param('idUserAutor') idUserAutor: string,
  ) {
    return this.avaliacoesService.listarPendentes(Number(idPacoteViagem), Number(idUserAutor));
  }
}
