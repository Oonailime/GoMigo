import { BadRequestException } from '@nestjs/common';
import { Prisma, TipoPacoteViagem } from '@prisma/client';
import { SearchPacotesDto } from './dto/search-pacotes.dto';

export type SearchMode = 'EXATO' | 'INTERSECCAO' | 'SEM_RESULTADOS';

export function normalizeCityFilter(value?: string) {
  if (!value) {
    return value;
  }

  return value.split(' - ')[0]?.trim() ?? value;
}

export function buildPacoteSearchContext(today: Date, dto: SearchPacotesDto) {
  const dataInicio = dto.dataInicio;
  const dataFim = dto.dataFim;

  if (dataInicio && dataFim && dataInicio > dataFim) {
    throw new BadRequestException('dataInicio nao pode ser maior que dataFim');
  }

  const cidadePartida = normalizeCityFilter(dto.cidadePartida);
  const cidadeDestino = normalizeCityFilter(dto.cidadeDestino);
  const page = dto.page ?? 1;
  const pageSize = dto.pageSize ?? 12;

  const baseWhere: Prisma.PacoteViagemWhereInput = {
    status: 'ATIVO',
    privacidade: { not: 'PRIVADO' },
    dataInicio: { not: null, gte: today },
  };

  if (dto.tipo) {
    baseWhere.tipoPacoteViagem = dto.tipo as TipoPacoteViagem;
  }

  if (cidadePartida) {
    baseWhere.enderecoPartida = {
      cidade: { contains: cidadePartida, mode: 'insensitive' },
    };
  }

  if (cidadeDestino) {
    baseWhere.enderecoDestino = {
      cidade: { contains: cidadeDestino, mode: 'insensitive' },
    };
  }

  return {
    dataInicio,
    dataFim,
    page,
    pageSize,
    baseWhere,
    pagination: {
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { dataCriacao: 'desc' as const },
    },
  };
}

export function buildSearchResponse<T>(
  mode: SearchMode,
  page: number,
  pageSize: number,
  total: number,
  pacotes: T[],
  mensagem?: string,
) {
  return {
    modo: mode,
    ...(mensagem ? { mensagem } : {}),
    pacotes,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}
