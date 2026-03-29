import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
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
    @Req() req: { user: { sub: number | null } },
    @Body() _body: CreateUserDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    throw new ForbiddenException('cadastro direto desabilitado; use o fluxo de autenticacao');
  }

  @Get()
  findAll(@Req() req: { user: { sub: number | null } }) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return this.usersService.findOne(req.user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    if (req.user.sub !== id) {
      throw new ForbiddenException('usuario nao pode visualizar outro perfil por esta rota');
    }

    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
    @Body() body: UpdateUserDto,
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    if (req.user.sub !== id) {
      throw new ForbiddenException('usuario nao pode alterar outro perfil por esta rota');
    }

    return this.usersService.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number | null } },
  ) {
    if (!req.user.sub) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    if (req.user.sub !== id) {
      throw new ForbiddenException('usuario nao pode remover outro perfil por esta rota');
    }

    return this.usersService.delete(id);
  }
}
