import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { AnunciosService } from './anuncios.service';

@Controller('anuncios')
export class AnunciosController {
  constructor(private readonly anunciosService: AnunciosService) {}

  @Post()
  create(@Body() body: {
    idPacoteViagem: number;
    idOrganizador: number;
    tituloAnuncio: string;
    descricaoAnuncio?: string;
    statusAnuncio: string;
    orcamento?: number;
    dataInicio?: Date;
    dataFim?: Date;
  }) {
    return this.anunciosService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: {
    tituloAnuncio?: string;
    descricaoAnuncio?: string;
    statusAnuncio?: string;
    orcamento?: number;
    dataInicio?: Date;
    dataFim?: Date;
  }) {
    return this.anunciosService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.anunciosService.delete(Number(id));
  }
}
