import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCaronaDto) {
    return this.caronasService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.caronasService.delete(Number(id));
  }
}
