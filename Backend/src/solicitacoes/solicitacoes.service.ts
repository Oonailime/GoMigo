import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SolicitacoesService {
  constructor(private readonly prisma: PrismaService) {}

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

    const solicitacaoExistente = await this.prisma.solicitacaoParticipacao.findFirst({
      where: {
        idPacoteViagem,
        idUser: data.idUser,
        statusSolicitacao: 'PENDENTE',
      },
    });

    if (solicitacaoExistente) {
      throw new ConflictException('solicitacao ja existente');
    }

    return this.prisma.solicitacaoParticipacao.create({
      data: {
        idPacoteViagem,
        idUser: data.idUser,
        mensagemSolicitacao: data.mensagemSolicitacao,
        statusSolicitacao: 'PENDENTE',
      },
    });
  }

  async aceitarSolicitacao(idSolicitacao: number, idUserOrganizador: number) {
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
      throw new ForbiddenException('apenas o organizador pode aceitar');
    }

    const totalViajantes = await this.prisma.viajante.count({
      where: { idPacoteViagem: pacote.id },
    });

    if (totalViajantes >= pacote.vagas) {
      throw new ConflictException('pacote sem vagas disponiveis');
    }

    return this.prisma.$transaction(async (tx) => {
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
}
