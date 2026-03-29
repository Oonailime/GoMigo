import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';
import { AnunciosService } from './anuncios.service';

@Controller('anuncios')
export class AnunciosController {
  constructor(private readonly anunciosService: AnunciosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUserId() userId: number, @Body() body: CreateAnuncioDto) {
    return this.anunciosService.create(userId, body);
  }

  @Get()
  findAll() {
    return this.anunciosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.anunciosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateAnuncioDto) {
    return this.anunciosService.update(userId, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.anunciosService.delete(userId, id);
  }
}
