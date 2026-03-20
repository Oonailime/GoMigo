import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SolicitacoesService {
  constructor(private readonly prisma: PrismaService) {}

  private async runSerializableTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        return await this.prisma.$transaction(fn, { isolationLevel: 'Serializable' });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034' &&
          attempt < maxRetries
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException('conflito de concorrencia, tente novamente');
  }

  async solicitarParticipacao(idPacoteViagem: number, data: {
    idUser: number;
    mensagemSolicitacao?: string;
  }) {
    if (!idPacoteViagem || Number.isNaN(idPacoteViagem)) {
      throw new BadRequestException('idPacoteViagem invalido');
    }

    const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: idPacoteViagem } });
    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    try {
      return await this.prisma.solicitacaoParticipacao.create({
        data: {
          idPacoteViagem,
          idUser: data.idUser,
          mensagemSolicitacao: data.mensagemSolicitacao,
          statusSolicitacao: 'PENDENTE',
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('solicitacao ja existente');
      }
      throw error;
    }
  }

  async aceitarSolicitacao(idSolicitacao: number, idUserOrganizador: number) {
    if (!idSolicitacao || Number.isNaN(idSolicitacao)) {
      throw new BadRequestException('idSolicitacao invalido');
    }

    return this.runSerializableTransaction(async (tx) => {
      const solicitacao = await tx.solicitacaoParticipacao.findUnique({
        where: { id: idSolicitacao },
      });

      if (!solicitacao) {
        throw new NotFoundException('solicitacao nao encontrada');
      }

      if (solicitacao.statusSolicitacao !== 'PENDENTE') {
        throw new ConflictException('solicitacao ja processada');
      }

      const pacote = await tx.pacoteViagem.findUnique({ where: { id: solicitacao.idPacoteViagem } });
      if (!pacote) {
        throw new NotFoundException('pacote nao encontrado');
      }

      if (pacote.idOrganizador !== idUserOrganizador) {
        throw new ForbiddenException('apenas o organizador pode aceitar');
      }

      const totalViajantes = await tx.viajante.count({
        where: { idPacoteViagem: pacote.id },
      });

      if (totalViajantes >= pacote.vagas) {
        throw new ConflictException('pacote sem vagas disponiveis');
      }

      await tx.viajante.create({
        data: {
          idPacoteViagem: pacote.id,
          idUser: solicitacao.idUser,
          statusParticipacao: 'ATIVO',
          permissao: 'VIAJANTE',
        },
      });

      return tx.solicitacaoParticipacao.update({
        where: { id: solicitacao.id },
        data: {
          statusSolicitacao: 'ACEITA',
          dataResposta: new Date(),
        },
      });
    });
  }

  async rejeitarSolicitacao(idSolicitacao: number, idUserOrganizador: number, motivoRecusa?: string) {
    if (!idSolicitacao || Number.isNaN(idSolicitacao)) {
      throw new BadRequestException('idSolicitacao invalido');
    }

    const solicitacao = await this.prisma.solicitacaoParticipacao.findUnique({
      where: { id: idSolicitacao },
    });

    if (!solicitacao) {
      throw new NotFoundException('solicitacao nao encontrada');
    }

    if (solicitacao.statusSolicitacao !== 'PENDENTE') {
      throw new ConflictException('solicitacao ja processada');
    }

    const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: solicitacao.idPacoteViagem } });
    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    if (pacote.idOrganizador !== idUserOrganizador) {
      throw new ForbiddenException('apenas o organizador pode rejeitar');
    }

    return this.prisma.solicitacaoParticipacao.update({
      where: { id: solicitacao.id },
      data: {
        statusSolicitacao: 'REJEITADA',
        motivoRecusa,
        dataResposta: new Date(),
      },
    });
  }

  async findOne(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('idSolicitacao invalido');
    }

    const solicitacao = await this.prisma.solicitacaoParticipacao.findUnique({ where: { id } });
    if (!solicitacao) {
      throw new NotFoundException('solicitacao nao encontrada');
    }

    return solicitacao;
  }

  async findByPacote(idPacoteViagem: number, idUserOrganizador: number) {
    if (!idPacoteViagem || Number.isNaN(idPacoteViagem)) {
      throw new BadRequestException('idPacoteViagem invalido');
    }

    const pacote = await this.prisma.pacoteViagem.findUnique({
      where: { id: idPacoteViagem },
    });

    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    if (pacote.idOrganizador !== idUserOrganizador) {
      throw new ForbiddenException('apenas o organizador pode visualizar as solicitacoes');
    }

    return this.prisma.solicitacaoParticipacao.findMany({
      where: { idPacoteViagem },
      orderBy: { dataSolicitacao: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
  }
}
