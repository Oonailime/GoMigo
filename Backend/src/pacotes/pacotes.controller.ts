import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdatePacoteDto) {
    return this.pacotesService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pacotesService.delete(Number(id));
  }

  @Get('anunciados')
  listarAnunciados() {
    return this.pacotesService.listarAnunciados();
  }
}
