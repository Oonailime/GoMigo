import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';
import { AnunciosService } from './anuncios.service';

@Controller('anuncios')
export class AnunciosController {
  constructor(private readonly anunciosService: AnunciosService) {}

  @Post()
  create(@Body() body: CreateAnuncioDto) {
    return this.anunciosService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAnuncioDto) {
    return this.anunciosService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.anunciosService.delete(Number(id));
  }
}
