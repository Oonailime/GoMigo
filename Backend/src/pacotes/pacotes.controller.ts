import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PacotesService } from './pacotes.service';

@Controller('pacotes')
export class PacotesController {
  constructor(private readonly pacotesService: PacotesService) {}

  @Post()
  create(@Body() body: {
    idOrganizador: number;
    idEnderecoPartida: number;
    idEnderecoDestino: number;
    titulo: string;
    descricao?: string;
    tipoPacoteViagem: string;
    status: string;
    vagas: number;
    regrasViagem: string;
    valorTotalPrevisto?: number;
    valorPorPessoaPrevisto?: number;
    dataInicio?: Date;
    dataFim?: Date;
    privacidade: string;
  }) {
    return this.pacotesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: {
    idEnderecoPartida?: number;
    idEnderecoDestino?: number;
    titulo?: string;
    descricao?: string;
    tipoPacoteViagem?: string;
    status?: string;
    vagas?: number;
    regrasViagem?: string;
    valorTotalPrevisto?: number;
    valorPorPessoaPrevisto?: number;
    dataInicio?: Date;
    dataFim?: Date;
    privacidade?: string;
  }) {
    return this.pacotesService.update(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pacotesService.delete(Number(id));
  }

  @Get('anunciados')
  listarAnunciados() {
    return this.pacotesService.listarAnunciados();
  }
}
