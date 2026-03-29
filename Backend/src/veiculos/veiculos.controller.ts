import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { VeiculosService } from './veiculos.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('veiculos')
@UseGuards(JwtAuthGuard)
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  create(
    @CurrentUserId() userId: number,
    @Body() body: CreateVeiculoDto,
  ) {
    return this.veiculosService.createForOwner(userId, {
      marca: body.marca,
      modelo: body.modelo,
      cor: body.cor,
      placa: body.placa,
      ano: body.ano,
      capacidadePassageiros: body.capacidadePassageiros,
    });
  }

  @Get()
  findAll(@CurrentUserId() userId: number) {
    return this.veiculosService.findByOwner(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.veiculosService.findOneForOwner(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
    @Body() body: UpdateVeiculoDto,
  ) {
    return this.veiculosService.updateForOwner(id, userId, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.veiculosService.deleteForOwner(id, userId);
  }
}
