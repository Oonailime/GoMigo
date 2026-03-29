import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { VeiculosService } from './veiculos.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('veiculos')
@UseGuards(JwtAuthGuard)
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  create(
    @Req() req: { user: { sub: number | null } },
    @Body() body: CreateVeiculoDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.veiculosService.createForOwner(req.user.sub, {
      marca: body.marca,
      modelo: body.modelo,
      cor: body.cor,
      placa: body.placa,
      ano: body.ano,
      capacidadePassageiros: body.capacidadePassageiros,
    });
  }

  @Get()
  findAll(@Req() req: { user: { sub: number | null } }) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.veiculosService.findByOwner(req.user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.veiculosService.findOneForOwner(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
    @Body() body: UpdateVeiculoDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.veiculosService.updateForOwner(id, req.user.sub, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.veiculosService.deleteForOwner(id, req.user.sub);
  }
}
