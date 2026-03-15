import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { EnderecosService } from './enderecos.service';

@Controller('enderecos')
export class EnderecosController {
  constructor(private readonly enderecosService: EnderecosService) {}

  @Post()
  create(@Body() body: {
    rua: string;
    cep: string;
    numero?: number;
    complemento?: string;
    estado: string;
    cidade: string;
  }) {
    return this.enderecosService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: {
    rua?: string;
    cep?: string;
    numero?: number;
    complemento?: string;
    estado?: string;
    cidade?: string;
  }) {
    return this.enderecosService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.enderecosService.delete(Number(id));
  }
}
