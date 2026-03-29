import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateEnderecoDto } from './dto/create-endereco.dto';
import { UpdateEnderecoDto } from './dto/update-endereco.dto';
import { EnderecosService } from './enderecos.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('enderecos')
@UseGuards(JwtAuthGuard)
export class EnderecosController {
  constructor(private readonly enderecosService: EnderecosService) {}

  @Post()
  create(
    @Req() req: { user: { sub: number | null } },
    @Body() body: CreateEnderecoDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.enderecosService.create(body);
  }

  @Get()
  findAll() {
    throw new ForbiddenException('listagem global de enderecos desabilitada');
  }

  @Get(':id')
  findOne(
    @Req() req: { user: { sub: number | null } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.enderecosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Req() req: { user: { sub: number | null } },
    @Param('id', ParseIntPipe) _id: number,
    @Body() _body: UpdateEnderecoDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    throw new ForbiddenException('alteracao direta de endereco desabilitada');
  }

  @Delete(':id')
  delete(
    @Req() req: { user: { sub: number | null } },
    @Param('id', ParseIntPipe) _id: number,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    throw new ForbiddenException('remocao direta de endereco desabilitada');
  }
}
