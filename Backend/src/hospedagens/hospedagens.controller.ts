import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateHospedagemDto } from './dto/create-hospedagem.dto';
import { UpdateHospedagemDto } from './dto/update-hospedagem.dto';
import { HospedagensService } from './hospedagens.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('hospedagens')
@UseGuards(JwtAuthGuard)
export class HospedagensController {
  constructor(private readonly hospedagensService: HospedagensService) {}

  @Post()
  create(
    @Req() req: { user: { sub: number | null } },
    @Body() body: CreateHospedagemDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.hospedagensService.createForOrganizer(req.user.sub, body);
  }

  @Get()
  findAll(@Req() req: { user: { sub: number | null } }) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.hospedagensService.findByOrganizer(req.user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.hospedagensService.findOneForOrganizer(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
    @Body() body: UpdateHospedagemDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.hospedagensService.updateForOrganizer(id, req.user.sub, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.hospedagensService.deleteForOrganizer(id, req.user.sub);
  }
}
