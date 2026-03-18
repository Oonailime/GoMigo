import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateHospedagemDto) {
    return this.hospedagensService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.hospedagensService.delete(Number(id));
  }
}
