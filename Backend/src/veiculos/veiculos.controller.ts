import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { VeiculosService } from './veiculos.service';

@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  create(@Body() body: {
    idUserProprietario: number;
    marca: string;
    modelo: string;
    cor?: string;
    placa: string;
    ano?: number;
    capacidadePassageiros: number;
  }) {
    return this.veiculosService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: {
    marca?: string;
    modelo?: string;
    cor?: string;
    placa?: string;
    ano?: number;
    capacidadePassageiros?: number;
  }) {
    return this.veiculosService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.veiculosService.delete(Number(id));
  }
}
