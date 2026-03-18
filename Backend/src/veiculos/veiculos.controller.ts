import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { VeiculosService } from './veiculos.service';

@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  create(@Body() body: CreateVeiculoDto) {
    return this.veiculosService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateVeiculoDto) {
    return this.veiculosService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.veiculosService.delete(Number(id));
  }
}
