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

  async solicitarParticipacao(idPacoteViagem: number, idUser: number, data: {
    mensagemSolicitacao?: string;
  }) {
    if (!idPacoteViagem || Number.isNaN(idPacoteViagem)) {
      throw new BadRequestException('idPacoteViagem invalido');
    }

    if (!idUser || Number.isNaN(idUser)) {
      throw new BadRequestException('idUser invalido');
    }

    const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: idPacoteViagem } });
    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    if (pacote.idOrganizador === idUser) {
      throw new ConflictException('o organizador nao pode solicitar participacao no proprio pacote');
    }

    const existingAccepted = await this.prisma.viajante.findUnique({
      where: {
        idPacoteViagem_idUser: {
          idPacoteViagem,
          idUser,
        },
      },
    });

    if (existingAccepted) {
      throw new ConflictException('usuario ja participa deste pacote');
    }

    try {
      return await this.prisma.solicitacaoParticipacao.create({
        data: {
          idPacoteViagem,
          idUser,
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

  async findOneForUser(id: number, idUser: number) {
    if (!idUser || Number.isNaN(idUser)) {
      throw new BadRequestException('idUser invalido');
    }

    const solicitacao = await this.prisma.solicitacaoParticipacao.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        pacoteViagem: {
          select: {
            id: true,
            titulo: true,
            idOrganizador: true,
          },
        },
      },
    });

    if (!solicitacao) {
      throw new NotFoundException('solicitacao nao encontrada');
    }

    const canAccess =
      solicitacao.idUser === idUser || solicitacao.pacoteViagem.idOrganizador === idUser;

    if (!canAccess) {
      throw new ForbiddenException('usuario nao pode visualizar esta solicitacao');
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

  async findMine(idUser: number) {
    if (!idUser || Number.isNaN(idUser)) {
      throw new BadRequestException('idUser invalido');
    }

    return this.prisma.solicitacaoParticipacao.findMany({
      where: { idUser },
      orderBy: { dataSolicitacao: 'desc' },
      include: {
        pacoteViagem: {
          select: {
            id: true,
            titulo: true,
            idOrganizador: true,
          },
        },
      },
    });
  }

  async getNotifications(idUser: number) {
    if (!idUser || Number.isNaN(idUser)) {
      throw new BadRequestException('idUser invalido');
    }

    const [organizerNotifications, travelerNotifications, evaluationNotifications] = await Promise.all([
      this.prisma.solicitacaoParticipacao.findMany({
        where: {
          pacoteViagem: {
            idOrganizador: idUser,
          },
        },
        orderBy: [
          { dataResposta: 'desc' },
          { dataSolicitacao: 'desc' },
        ],
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          pacoteViagem: {
            select: {
              id: true,
              titulo: true,
            },
          },
        },
      }),
      this.prisma.solicitacaoParticipacao.findMany({
        where: {
          idUser,
          statusSolicitacao: {
            in: ['ACEITA', 'REJEITADA'],
          },
        },
        orderBy: [
          { dataResposta: 'desc' },
          { dataSolicitacao: 'desc' },
        ],
        include: {
          pacoteViagem: {
            select: {
              id: true,
              titulo: true,
            },
          },
        },
      }),
      this.prisma.avaliacao.findMany({
        where: {
          idUserAvaliado: idUser,
        },
        orderBy: {
          dataAvaliacao: 'desc',
        },
        take: 20,
        include: {
          autor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          pacoteViagem: {
            select: {
              id: true,
              titulo: true,
            },
          },
        },
      }),
    ]);

    return {
      totalPendentes: organizerNotifications.length,
      totalRespostas: travelerNotifications.length,
      totalAvaliacoes: evaluationNotifications.length,
      total:
        organizerNotifications.length +
        travelerNotifications.length +
        evaluationNotifications.length,
      organizerNotifications,
      travelerNotifications,
      evaluationNotifications,
    };
  }
}
