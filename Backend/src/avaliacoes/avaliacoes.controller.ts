import { Body, Controller, Post } from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  criar(@Body() body: {
    tipo: 'PACOTE' | 'ORGANIZADOR' | 'VIAJANTE';
    idUserAutor: number;
    idPacoteViagem?: number;
    idUserAvaliado?: number;
    nota: number;
    comentario?: string;
  }) {
    return this.avaliacoesService.criar(body);
  }
}
