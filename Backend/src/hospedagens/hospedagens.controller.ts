import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
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
    @CurrentUserId() userId: number,
    @Body() body: CreateHospedagemDto,
  ) {
    return this.hospedagensService.createForOrganizer(userId, body);
  }

  @Get()
  findAll(@CurrentUserId() userId: number) {
    return this.hospedagensService.findByOrganizer(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.hospedagensService.findOneForOrganizer(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
    @Body() body: UpdateHospedagemDto,
  ) {
    return this.hospedagensService.updateForOrganizer(id, userId, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.hospedagensService.deleteForOrganizer(id, userId);
  }
}
