import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CreateCaronaDto } from './dto/create-carona.dto';
import { UpdateCaronaDto } from './dto/update-carona.dto';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { CaronasService } from './caronas.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('caronas')
@UseGuards(JwtAuthGuard)
export class CaronasController {
  constructor(private readonly caronasService: CaronasService) {}

  @Post()
  create(
    @CurrentUserId() userId: number,
    @Body() body: CreateCaronaDto,
  ) {
    return this.caronasService.createForOrganizer(userId, {
      idPacoteViagem: body.idPacoteViagem,
      idVeiculo: body.idVeiculo,
      dataIda: body.dataIda,
      dataVolta: body.dataVolta,
      precoTotal: body.precoTotal,
      precoPorPessoa: body.precoPorPessoa,
      idEnderecoPartida: body.idEnderecoPartida,
      idEnderecoDestino: body.idEnderecoDestino,
      regrasCarona: body.regrasCarona,
      vagasDisponiveis: body.vagasDisponiveis,
      status: body.status,
    });
  }

  @Get()
  findAll(@CurrentUserId() userId: number) {
    return this.caronasService.findByOrganizer(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.caronasService.findOneForOrganizer(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
    @Body() body: UpdateCaronaDto,
  ) {
    return this.caronasService.updateForOrganizer(id, userId, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.caronasService.deleteForOrganizer(id, userId);
  }
}
