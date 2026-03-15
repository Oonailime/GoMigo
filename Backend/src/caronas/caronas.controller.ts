import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CaronasService } from './caronas.service';

@Controller('caronas')
export class CaronasController {
  constructor(private readonly caronasService: CaronasService) {}

  @Post()
  create(@Body() body: {
    idPacoteViagem: number;
    idVeiculo?: number;
    idMotorista: number;
    dataIda?: Date;
    dataVolta?: Date;
    precoTotal?: number;
    precoPorPessoa?: number;
    idEnderecoPartida?: number;
    idEnderecoDestino?: number;
    regrasCarona: string;
    vagasDisponiveis?: number;
    status: string;
  }) {
    return this.caronasService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: {
    idVeiculo?: number;
    dataIda?: Date;
    dataVolta?: Date;
    precoTotal?: number;
    precoPorPessoa?: number;
    idEnderecoPartida?: number;
    idEnderecoDestino?: number;
    regrasCarona?: string;
    vagasDisponiveis?: number;
    status?: string;
  }) {
    return this.caronasService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.caronasService.delete(Number(id));
  }
}
