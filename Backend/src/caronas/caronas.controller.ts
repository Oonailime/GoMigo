import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { CreateCaronaDto } from './dto/create-carona.dto';
import { UpdateCaronaDto } from './dto/update-carona.dto';
import { CaronasService } from './caronas.service';

@Controller('caronas')
export class CaronasController {
  constructor(private readonly caronasService: CaronasService) {}

  @Post()
  create(@Body() body: CreateCaronaDto) {
    return this.caronasService.create(body);
  }

  @Get()
  findAll() {
    return this.caronasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.caronasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCaronaDto) {
    return this.caronasService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.caronasService.delete(id);
  }
}
