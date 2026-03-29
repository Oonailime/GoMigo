import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateCaronaDto } from './dto/create-carona.dto';
import { UpdateCaronaDto } from './dto/update-carona.dto';
import { CaronasService } from './caronas.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('caronas')
@UseGuards(JwtAuthGuard)
export class CaronasController {
  constructor(private readonly caronasService: CaronasService) {}

  @Post()
  create(
    @Req() req: { user: { sub: number | null } },
    @Body() body: CreateCaronaDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.caronasService.createForOrganizer(req.user.sub, {
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
  findAll(@Req() req: { user: { sub: number | null } }) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.caronasService.findByOrganizer(req.user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.caronasService.findOneForOrganizer(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
    @Body() body: UpdateCaronaDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.caronasService.updateForOrganizer(id, req.user.sub, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.caronasService.deleteForOrganizer(id, req.user.sub);
  }
}
