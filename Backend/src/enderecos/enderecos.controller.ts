import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
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
    @CurrentUserId() _userId: number,
    @Body() body: CreateEnderecoDto,
  ) {
    return this.enderecosService.create(body);
  }

  @Get()
  findAll() {
    throw new ForbiddenException('listagem global de enderecos desabilitada');
  }

  @Get(':id')
  findOne(
    @CurrentUserId() _userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.enderecosService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUserId() _userId: number,
    @Param('id', ParseIntPipe) _id: number,
    @Body() _body: UpdateEnderecoDto,
  ) {
    throw new ForbiddenException('alteracao direta de endereco desabilitada');
  }

  @Delete(':id')
  delete(
    @CurrentUserId() _userId: number,
    @Param('id', ParseIntPipe) _id: number,
  ) {
    throw new ForbiddenException('remocao direta de endereco desabilitada');
  }
}
