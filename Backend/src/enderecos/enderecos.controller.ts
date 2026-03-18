import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CreateEnderecoDto } from './dto/create-endereco.dto';
import { UpdateEnderecoDto } from './dto/update-endereco.dto';
import { EnderecosService } from './enderecos.service';

@Controller('enderecos')
export class EnderecosController {
  constructor(private readonly enderecosService: EnderecosService) {}

  @Post()
  create(@Body() body: CreateEnderecoDto) {
    return this.enderecosService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateEnderecoDto) {
    return this.enderecosService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.enderecosService.delete(Number(id));
  }
}
