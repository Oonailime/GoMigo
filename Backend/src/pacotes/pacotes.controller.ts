import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { CreatePacoteDto } from './dto/create-pacote.dto';
import { UpdatePacoteDto } from './dto/update-pacote.dto';
import { PacotesService } from './pacotes.service';

@Controller('pacotes')
export class PacotesController {
  constructor(private readonly pacotesService: PacotesService) {}

  @Post()
  create(@Body() body: CreatePacoteDto) {
    return this.pacotesService.create(body);
  }

  @Get()
  findAll() {
    return this.pacotesService.findAll();
  }

  @Get('anunciados')
  listarAnunciados() {
    return this.pacotesService.listarAnunciados();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pacotesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdatePacoteDto) {
    return this.pacotesService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.pacotesService.delete(id);
  }
}
