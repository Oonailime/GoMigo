import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { CreateHospedagemDto } from './dto/create-hospedagem.dto';
import { UpdateHospedagemDto } from './dto/update-hospedagem.dto';
import { HospedagensService } from './hospedagens.service';

@Controller('hospedagens')
export class HospedagensController {
  constructor(private readonly hospedagensService: HospedagensService) {}

  @Post()
  create(@Body() body: CreateHospedagemDto) {
    return this.hospedagensService.create(body);
  }

  @Get()
  findAll() {
    return this.hospedagensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hospedagensService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateHospedagemDto) {
    return this.hospedagensService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.hospedagensService.delete(id);
  }
}
