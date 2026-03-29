import { Body, Controller, Delete, ForbiddenException, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { CurrentUserRouteId } from '../auth/current-user-route-id.decorator';
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
    @CurrentUserRouteId() id: number,
  ) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUserRouteId() id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  delete(
    @CurrentUserRouteId() id: number,
  ) {
    return this.usersService.delete(id);
  }
}
