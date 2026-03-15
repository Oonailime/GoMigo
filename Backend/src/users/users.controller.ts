import { BadRequestException, Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: {
    name: string;
    cpf: string;
    phoneNumber: string;
    email: string;
    status: string;
  }) {
    if (!body || !body.name || !body.cpf || !body.phoneNumber || !body.email || !body.status) {
      throw new BadRequestException('body invalido');
    }
    return this.usersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: {
    name?: string;
    cpf?: string;
    phoneNumber?: string;
    email?: string;
    status?: string;
  }) {
    return this.usersService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(Number(id));
  }
}
