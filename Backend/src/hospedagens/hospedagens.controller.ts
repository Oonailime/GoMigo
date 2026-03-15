import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { HospedagensService } from './hospedagens.service';

@Controller('hospedagens')
export class HospedagensController {
  constructor(private readonly hospedagensService: HospedagensService) {}

  @Post()
  create(@Body() body: {
    idPacoteViagem: number;
    idEndereco?: number;
    nomeLocal?: string;
    dataCheckin?: Date;
    dataCheckout?: Date;
    precoTotal?: number;
    precoPorPessoa?: number;
    regrasHospedagem: string;
    statusReserva: string;
  }) {
    return this.hospedagensService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: {
    idEndereco?: number;
    nomeLocal?: string;
    dataCheckin?: Date;
    dataCheckout?: Date;
    precoTotal?: number;
    precoPorPessoa?: number;
    regrasHospedagem?: string;
    statusReserva?: string;
  }) {
    return this.hospedagensService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.hospedagensService.delete(Number(id));
  }
}
