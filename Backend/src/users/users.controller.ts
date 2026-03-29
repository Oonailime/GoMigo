import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @CurrentUserId() _userId: number,
    @Body() _body: CreateUserDto,
  ) {
    throw new ForbiddenException('cadastro direto desabilitado; use o fluxo de autenticacao');
  }

  @Get()
  findAll(@CurrentUserId() userId: number) {
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    if (userId !== id) {
      throw new ForbiddenException('usuario nao pode visualizar outro perfil por esta rota');
    }

    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
    @Body() body: UpdateUserDto,
  ) {
    if (userId !== id) {
      throw new ForbiddenException('usuario nao pode alterar outro perfil por esta rota');
    }

    return this.usersService.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    if (userId !== id) {
      throw new ForbiddenException('usuario nao pode remover outro perfil por esta rota');
    }

    return this.usersService.delete(id);
  }
}
