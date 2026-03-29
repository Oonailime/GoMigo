import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, ParseIntPipe, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { CreatePacoteDto } from './dto/create-pacote.dto';
import { UpsertRoteiroDto } from './dto/upsert-roteiro.dto';
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
    @CurrentUserId() userId: number,
    @Body() body: CreatePacoteDto,
  ) {
    return this.pacotesService.create({
      ...body,
      idOrganizador: userId,
    });
  }

  @Get()
  findAll() {
    return this.pacotesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('meus')
  findMine(@CurrentUserId() userId: number) {
    return this.pacotesService.findByOrganizador(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('minhas-viagens')
  findMyTrips(@CurrentUserId() userId: number) {
    return this.pacotesService.findTripsForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/gerenciar')
  findOneForManagement(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.pacotesService.findOneForOrganizador(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/detalhes')
  findOneForParticipant(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.pacotesService.findOneForParticipant(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/roteiro')
  findItinerary(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.pacotesService.findItineraryForParticipant(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/roteiro')
  upsertItinerary(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
    @Body() body: UpsertRoteiroDto,
  ) {
    return this.pacotesService.upsertItinerary(id, userId, body);
  }

  @Get('search')
  search(@Query() query: SearchPacotesDto) {
    return this.pacotesService.search(query);
  }

  @Get('anunciados')
  listarAnunciados() {
    return this.pacotesService.listarAnunciados();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.pacotesService.findOneForParticipant(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
    @Body() body: UpdatePacoteDto,
  ) {
    const pacote = await this.pacotesService.findOne(id);
    if (pacote.idOrganizador !== userId) {
      throw new UnauthorizedException('apenas o organizador pode editar o pacote');
    }

    return this.pacotesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.pacotesService.deleteForOrganizador(id, userId);
  }

  @Delete(':id/reserva')
  @UseGuards(JwtAuthGuard)
  cancelReservation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.pacotesService.cancelReservation(id, userId);
  }
}
