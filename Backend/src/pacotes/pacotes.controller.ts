import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreatePacoteDto } from './dto/create-pacote.dto';
import { UpdatePacoteDto } from './dto/update-pacote.dto';
import { SearchPacotesDto } from './dto/search-pacotes.dto';
import { PacotesService } from './pacotes.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('pacotes')
export class PacotesController {
  constructor(private readonly pacotesService: PacotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: { user: { sub: number | null } },
    @Body() body: CreatePacoteDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.pacotesService.create({
      ...body,
      idOrganizador: req.user.sub,
    });
  }

  @Get()
  findAll() {
    return this.pacotesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('meus')
  findMine(@Req() req: { user: { sub: number | null } }) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.pacotesService.findByOrganizador(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/gerenciar')
  findOneForManagement(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.pacotesService.findOneForOrganizador(id, req.user.sub);
  }

  @Get('search')
  search(@Query() query: SearchPacotesDto) {
    return this.pacotesService.search(query);
  }

  @Get('anunciados')
  listarAnunciados() {
    return this.pacotesService.listarAnunciados();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pacotesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
    @Body() body: UpdatePacoteDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    const pacote = await this.pacotesService.findOne(id);
    if (pacote.idOrganizador !== req.user.sub) {
      throw new UnauthorizedException('apenas o organizador pode editar o pacote');
    }

    return this.pacotesService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.pacotesService.delete(id);
  }
}
