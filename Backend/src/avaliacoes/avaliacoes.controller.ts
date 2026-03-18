import { Body, Controller, Post } from '@nestjs/common';
import { CriarAvaliacaoDto } from './dto/criar-avaliacao.dto';
import { AvaliacoesService } from './avaliacoes.service';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  criar(@Body() body: CriarAvaliacaoDto) {
    return this.avaliacoesService.criar(body);
  }
}
