import { after, before, test } from 'node:test';
import * as assert from 'node:assert/strict';
import * as jwt from 'jsonwebtoken';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AnunciosController } from '../src/anuncios/anuncios.controller';
import { AnunciosService } from '../src/anuncios/anuncios.service';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { AvaliacoesController } from '../src/avaliacoes/avaliacoes.controller';
import { AvaliacoesService } from '../src/avaliacoes/avaliacoes.service';
import { CaronasController } from '../src/caronas/caronas.controller';
import { CaronasService } from '../src/caronas/caronas.service';
import { EnderecosController } from '../src/enderecos/enderecos.controller';
import { EnderecosService } from '../src/enderecos/enderecos.service';
import { HospedagensController } from '../src/hospedagens/hospedagens.controller';
import { HospedagensService } from '../src/hospedagens/hospedagens.service';
import { readCurrentUserId } from '../src/auth/current-user-id.decorator';
import { readCurrentUserRouteId } from '../src/auth/current-user-route-id.decorator';
import { JwtAuthGuard } from '../src/auth/jwt.guard';
import { PacotesController } from '../src/pacotes/pacotes.controller';
import { PacotesService } from '../src/pacotes/pacotes.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { SolicitacoesController } from '../src/solicitacoes/solicitacoes.controller';
import { SolicitacoesService } from '../src/solicitacoes/solicitacoes.service';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { VeiculosController } from '../src/veiculos/veiculos.controller';
import { VeiculosService } from '../src/veiculos/veiculos.service';

type AuthenticatedRequest = {
  headers: Record<string, string | undefined>;
  params?: Record<string, string | undefined>;
  user?: { sub?: number | null; email?: string };
};

let originalJwtSecret: string | undefined;
let lastAnuncioCreateArgs: unknown;
let lastAnuncioUpdateArgs: unknown;
let lastAnuncioDeleteArgs: unknown;
let lastPacoteUpdateArgs: unknown;
let lastPacoteDeleteArgs: unknown;
let lastViajanteCreateArgs: unknown;
let lastSolicitacaoUpdateArgs: unknown;
let lastVeiculoCreateArgs: unknown;
let lastCaronaCreateArgs: unknown;
let lastHospedagemCreateArgs: unknown;
let lastEnderecoCreateArgs: unknown;
let lastAvaliacaoCreateArgs: unknown;
let lastAuthCompleteProfileArgs: unknown;
let lastAuthGetProfileArgs: unknown;
let lastAuthUpdateProfileArgs: unknown;

const prismaMock = {
  user: {
    findUnique: async ({ where }: { where: { id: number } }) => {
      if (where.id === 1) {
        return {
          id: 1,
          name: 'Usuario Teste',
          email: 'user@example.com',
          phoneNumber: '71999999999',
        };
      }

      return null;
    },
    update: async ({ where, data }: { where: { id: number }; data: unknown }) => ({
      id: where.id,
      ...(data as object),
    }),
    delete: async ({ where }: { where: { id: number } }) => ({ id: where.id }),
  },
  pacoteViagem: {
    findUnique: async ({ where }: { where: { id: number } }) => {
      if (where.id === 9) {
        return {
          id: 9,
          idOrganizador: 42,
          titulo: 'Pacote permitido',
          enderecoPartida: null,
          enderecoDestino: null,
          organizador: {
            id: 42,
            name: 'Organizador',
            email: 'org@example.com',
            phoneNumber: '71999999999',
          },
          viajantes: [
            {
              idUser: 8,
              user: {
                id: 8,
                name: 'Viajante',
                email: 'viajante@example.com',
                phoneNumber: '71888888888',
              },
            },
          ],
        };
      }

      if (where.id === 10) {
        return {
          id: 10,
          idOrganizador: 42,
        };
      }

      if (where.id === 11) {
        return {
          id: 11,
          idOrganizador: 77,
          titulo: 'Pacote de outro organizador',
          enderecoPartida: null,
          enderecoDestino: null,
          organizador: {
            id: 77,
            name: 'Outro Organizador',
            email: 'outro@example.com',
            phoneNumber: '71777777777',
          },
          viajantes: [],
        };
      }

      if (where.id === 21) {
        return {
          id: 21,
          idOrganizador: 77,
          vagas: 3,
        };
      }

      if (where.id === 22) {
        return {
          id: 22,
          idOrganizador: 42,
          vagas: 3,
        };
      }

      if (where.id === 30) {
        return {
          id: 30,
          idOrganizador: 42,
          status: 'FINALIZADO',
          dataFim: new Date('2026-01-01T00:00:00.000Z'),
          titulo: 'Pacote avaliado',
        };
      }

      return null;
    },
    update: async ({ where, data }: { where: { id: number }; data: unknown }) => {
      lastPacoteUpdateArgs = { where, data };
      return {
        id: where.id,
        ...(data as object),
      };
    },
    delete: async ({ where }: { where: { id: number } }) => {
      lastPacoteDeleteArgs = { where };
      return { id: where.id };
    },
    findMany: async () => [],
    count: async () => 0,
  },
  anuncioPacote: {
    create: async (args: unknown) => {
      lastAnuncioCreateArgs = args;
      return { id: 99, ...(args as { data: object }).data };
    },
    findMany: async () => [],
    findUnique: async ({ where }: { where: { id: number } }) => {
      if (where.id === 99) {
        return { id: 99, idOrganizador: 42 };
      }

      return null;
    },
    update: async ({ where, data }: { where: { id: number }; data: unknown }) => {
      lastAnuncioUpdateArgs = { where, data };
      return {
        id: where.id,
        ...(data as object),
      };
    },
    delete: async ({ where }: { where: { id: number } }) => {
      lastAnuncioDeleteArgs = { where };
      return { id: where.id };
    },
  },
  veiculo: {
    create: async (args: unknown) => {
      lastVeiculoCreateArgs = args;
      return { id: 701, ...(args as { data: object }).data };
    },
    findMany: async () => [],
    findUnique: async ({ where }: { where: { id: number } }) => {
      if (where.id === 701) {
        return {
          id: 701,
          idUserProprietario: 42,
          marca: 'Fiat',
          modelo: 'Argo',
          placa: 'ABC1234',
          capacidadePassageiros: 4,
        };
      }

      return null;
    },
    update: async ({ where, data }: { where: { id: number }; data: unknown }) => ({
      id: where.id,
      ...(data as object),
    }),
    delete: async ({ where }: { where: { id: number } }) => ({ id: where.id }),
  },
  endereco: {
    create: async (args: unknown) => {
      lastEnderecoCreateArgs = args;
      return { id: 801, ...(args as { data: object }).data };
    },
    findMany: async () => [],
    findUnique: async ({ where }: { where: { id: number } }) => {
      if (where.id === 801) {
        return {
          id: 801,
          rua: 'Rua A',
          cep: '40000000',
          cidade: 'Salvador',
          estado: 'BA',
        };
      }

      return null;
    },
    update: async ({ where, data }: { where: { id: number }; data: unknown }) => ({
      id: where.id,
      ...(data as object),
    }),
    delete: async ({ where }: { where: { id: number } }) => ({ id: where.id }),
    findFirst: async () => null,
  },
  solicitacaoParticipacao: {
    create: async (args: unknown) => ({ id: 1, ...(args as { data: object }).data }),
    findUnique: async ({ where }: { where: { id: number } }) => {
      if (where.id === 31) {
        return {
          id: 31,
          idPacoteViagem: 22,
          idUser: 8,
          statusSolicitacao: 'PENDENTE',
        };
      }

      if (where.id === 32) {
        return {
          id: 32,
          idPacoteViagem: 22,
          idUser: 8,
          statusSolicitacao: 'PENDENTE',
        };
      }

      return null;
    },
    findMany: async () => [],
    update: async (args: unknown) => {
      lastSolicitacaoUpdateArgs = args;
      return args;
    },
  },
  viajante: {
    findUnique: async ({ where }: { where: { idPacoteViagem_idUser: { idPacoteViagem: number; idUser: number } } }) => {
      const key = where.idPacoteViagem_idUser;
      if (
        (key.idPacoteViagem === 30 && key.idUser === 8) ||
        (key.idPacoteViagem === 30 && key.idUser === 7)
      ) {
        return {
          idPacoteViagem: key.idPacoteViagem,
          idUser: key.idUser,
          statusParticipacao: 'ATIVO',
        };
      }

      return null;
    },
    count: async () => 0,
    create: async (args: unknown) => {
      lastViajanteCreateArgs = args;
      return args;
    },
    delete: async () => ({ success: true }),
    findMany: async ({ where }: { where?: { idPacoteViagem?: number; statusParticipacao?: string } } = {}) => {
      if (where?.idPacoteViagem === 30 && where?.statusParticipacao === 'ATIVO') {
        return [{ idUser: 7 }, { idUser: 8 }];
      }

      return [];
    },
  },
  avaliacao: {
    create: async (args: unknown) => {
      lastAvaliacaoCreateArgs = args;
      return { id: 901, ...(args as { data: object }).data };
    },
    findFirst: async () => null,
    groupBy: async () => [],
    findMany: async ({ where }: { where?: { idPacoteViagem?: number; idUserAutor?: number } } = {}) => {
      if (where?.idPacoteViagem === 30 && where?.idUserAutor === 8) {
        return [];
      }

      return [];
    },
    aggregate: async () => ({
      _avg: { nota: null },
      _count: { _all: 0 },
    }),
  },
  roteiro: {
    findMany: async ({ where }: { where: { idPacoteViagem: number } }) => {
      if (where.idPacoteViagem === 9) {
        return [
          {
            id: 201,
            titulo: 'Roteiro principal',
            descricao: 'Descricao do roteiro',
            atividades: [
              {
                id: 301,
                titulo: 'Passeio',
                descricao: 'Descricao passeio',
                dataHoraInicio: new Date('2026-05-01T12:00:00.000Z'),
                dataHoraFim: new Date('2026-05-01T14:00:00.000Z'),
                preco: 50,
                categoriaAtividade: { nome: 'Passeio/Turismo' },
                endereco: { cidade: 'Lençois', estado: 'BA' },
              },
            ],
          },
        ];
      }

      return [];
    },
  },
  carona: {
    create: async (args: unknown) => {
      lastCaronaCreateArgs = args;
      return { id: 401, ...(args as { data: object }).data };
    },
    findMany: async ({ where }: { where: { idPacoteViagem: number } }) => {
      if (where.idPacoteViagem === 9) {
        return [
          {
            id: 401,
            enderecoPartida: { cidade: 'Salvador', estado: 'BA' },
            enderecoDestino: { cidade: 'Lençois', estado: 'BA' },
            dataIda: new Date('2026-05-01T08:00:00.000Z'),
            dataVolta: new Date('2026-05-03T18:00:00.000Z'),
            precoPorPessoa: 120,
            regrasCarona: 'Sem atrasos',
            status: 'PLANEJADA',
          },
        ];
      }

      return [];
    },
    findUnique: async ({ where }: { where: { id: number } }) => {
      if (where.id === 401) {
        return {
          id: 401,
          pacoteViagem: {
            idOrganizador: 42,
          },
        };
      }

      return null;
    },
    update: async ({ where, data }: { where: { id: number }; data: unknown }) => ({
      id: where.id,
      ...(data as object),
    }),
    delete: async ({ where }: { where: { id: number } }) => ({ id: where.id }),
  },
  hospedagem: {
    create: async (args: unknown) => {
      lastHospedagemCreateArgs = args;
      return { id: 501, ...(args as { data: object }).data };
    },
    findMany: async ({ where }: { where: { idPacoteViagem: number } }) => {
      if (where.idPacoteViagem === 9) {
        return [
          {
            id: 501,
            nomeLocal: 'Pousada Azul',
            endereco: { cidade: 'Lençois', estado: 'BA' },
            dataCheckin: new Date('2026-05-01T14:00:00.000Z'),
            dataCheckout: new Date('2026-05-03T10:00:00.000Z'),
            precoPorPessoa: 300,
            regrasHospedagem: 'Levar documento',
            statusReserva: 'CONFIRMADA',
          },
        ];
      }

      return [];
    },
    findUnique: async ({ where }: { where: { id: number } }) => {
      if (where.id === 501) {
        return {
          id: 501,
          pacoteViagem: {
            idOrganizador: 42,
          },
        };
      }

      return null;
    },
    update: async ({ where, data }: { where: { id: number }; data: unknown }) => ({
      id: where.id,
      ...(data as object),
    }),
    delete: async ({ where }: { where: { id: number } }) => ({ id: where.id }),
  },
  $transaction: async <T>(fn: (tx: typeof prismaMock) => Promise<T>) => fn(prismaMock),
};

let usersController: UsersController;
let anunciosController: AnunciosController;
let authController: AuthController;
let avaliacoesController: AvaliacoesController;
let caronasController: CaronasController;
let enderecosController: EnderecosController;
let hospedagensController: HospedagensController;
let solicitacoesController: SolicitacoesController;
let pacotesController: PacotesController;
let veiculosController: VeiculosController;
let jwtAuthGuard: JwtAuthGuard;

const authServiceMock = {
  handleGoogleLogin: async (idToken: string) => ({
    accessToken: `backend-${idToken}`,
    userStatus: 'INCOMPLETE',
    userId: null,
  }),
  completeProfile: async (email: string, name: string | null, body: unknown) => {
    lastAuthCompleteProfileArgs = { email, name, body };
    return {
      accessToken: 'completed-token',
      userStatus: 'ACTIVE',
      user: {
        id: 1,
        email,
        name: name ?? 'Usuario',
      },
    };
  },
  getProfile: async (email: string) => {
    lastAuthGetProfileArgs = email;
    return {
      id: 1,
      email,
      name: 'Perfil',
    };
  },
  updateProfile: async (email: string, body: unknown) => {
    lastAuthUpdateProfileArgs = { email, body };
    return {
      id: 1,
      email,
      ...(body as object),
    };
  },
};

function createBearerToken(sub: number) {
  return jwt.sign(
    {
      sub,
      email: `user${sub}@example.com`,
    },
    process.env.BACKEND_JWT_SECRET as string,
  );
}

function createRequest({
  tokenSub,
  params,
}: {
  tokenSub?: number;
  params?: Record<string, string | undefined>;
} = {}): AuthenticatedRequest {
  return {
    headers: tokenSub !== undefined ? { authorization: `Bearer ${createBearerToken(tokenSub)}` } : {},
    params,
  };
}

function createExecutionContext(request: AuthenticatedRequest): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

before(async () => {
  originalJwtSecret = process.env.BACKEND_JWT_SECRET;
  process.env.BACKEND_JWT_SECRET = 'integration-test-secret';

  const moduleRef = await Test.createTestingModule({
    controllers: [
      UsersController,
      AnunciosController,
      AuthController,
      AvaliacoesController,
      CaronasController,
      EnderecosController,
      HospedagensController,
      SolicitacoesController,
      PacotesController,
      VeiculosController,
    ],
    providers: [
      UsersService,
      AnunciosService,
      AvaliacoesService,
      CaronasService,
      EnderecosService,
      HospedagensService,
      SolicitacoesService,
      PacotesService,
      VeiculosService,
      JwtAuthGuard,
      {
        provide: AuthService,
        useValue: authServiceMock,
      },
      {
        provide: PrismaService,
        useValue: prismaMock,
      },
    ],
  }).compile();

  usersController = moduleRef.get(UsersController);
  anunciosController = moduleRef.get(AnunciosController);
  authController = moduleRef.get(AuthController);
  avaliacoesController = moduleRef.get(AvaliacoesController);
  caronasController = moduleRef.get(CaronasController);
  enderecosController = moduleRef.get(EnderecosController);
  hospedagensController = moduleRef.get(HospedagensController);
  solicitacoesController = moduleRef.get(SolicitacoesController);
  pacotesController = moduleRef.get(PacotesController);
  veiculosController = moduleRef.get(VeiculosController);
  jwtAuthGuard = moduleRef.get(JwtAuthGuard);
});

after(() => {
  process.env.BACKEND_JWT_SECRET = originalJwtSecret;
});

test('GET /users/:id returns 403 when the route id does not match the authenticated user', () => {
  const request = createRequest({ tokenSub: 1, params: { id: '2' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);
  assert.throws(
    () => readCurrentUserRouteId(request),
    (error: unknown) =>
      (error as { message?: string }).message === 'usuario nao pode acessar outro perfil por esta rota',
  );
});

test('GET /users/:id returns the profile when the authenticated user matches the route id', async () => {
  const request = createRequest({ tokenSub: 1, params: { id: '1' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const user = await usersController.findOne(readCurrentUserRouteId(request));

  assert.equal(user.id, 1);
  assert.equal(user.email, 'user@example.com');
});

test('POST /anuncios rejects requests without a bearer token', () => {
  const request = createRequest();
  const context = createExecutionContext(request);

  assert.throws(
    () => jwtAuthGuard.canActivate(context),
    (error: unknown) =>
      error instanceof UnauthorizedException && error.message === 'token ausente',
  );
});

test('POST /anuncios uses the authenticated organizer id', async () => {
  lastAnuncioCreateArgs = undefined;
  const request = createRequest({ tokenSub: 42 });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await anunciosController.create(readCurrentUserId(request), {
    idPacoteViagem: 10,
    tituloAnuncio: 'Novo anuncio',
    descricaoAnuncio: 'Detalhes',
    statusAnuncio: 'ATIVO',
    orcamento: 1500,
  });

  assert.deepEqual(lastAnuncioCreateArgs, {
    data: {
      idPacoteViagem: 10,
      tituloAnuncio: 'Novo anuncio',
      descricaoAnuncio: 'Detalhes',
      statusAnuncio: 'ATIVO',
      orcamento: 1500,
      idOrganizador: 42,
    },
  });
  assert.equal(result.idOrganizador, 42);
});

test('PATCH /anuncios/:id blocks updates from another organizer', async () => {
  const request = createRequest({ tokenSub: 7, params: { id: '99' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  await assert.rejects(
    anunciosController.update(readCurrentUserId(request), 99, {
      tituloAnuncio: 'Nao deveria alterar',
    }),
    (error: unknown) =>
      (error as { message?: string }).message === 'somente o organizador do anuncio pode altera-lo',
  );
});

test('PATCH /anuncios/:id updates when the organizer owns the anuncio', async () => {
  lastAnuncioUpdateArgs = undefined;
  const request = createRequest({ tokenSub: 42, params: { id: '99' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await anunciosController.update(readCurrentUserId(request), 99, {
    tituloAnuncio: 'Titulo atualizado',
  });

  assert.deepEqual(lastAnuncioUpdateArgs, {
    where: { id: 99 },
    data: {
      tituloAnuncio: 'Titulo atualizado',
    },
  });
  assert.equal(result.tituloAnuncio, 'Titulo atualizado');
});

test('DELETE /anuncios/:id deletes when the organizer owns the anuncio', async () => {
  lastAnuncioDeleteArgs = undefined;
  const request = createRequest({ tokenSub: 42, params: { id: '99' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await anunciosController.delete(readCurrentUserId(request), 99);

  assert.deepEqual(lastAnuncioDeleteArgs, {
    where: { id: 99 },
  });
  assert.equal(result.id, 99);
});

test('GET /solicitacoes/pacote/:id rejects non-organizers', async () => {
  const request = createRequest({ tokenSub: 12, params: { idPacoteViagem: '21' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  await assert.rejects(
    solicitacoesController.findByPacote(21, readCurrentUserId(request)),
    (error: unknown) =>
      (error as { message?: string }).message === 'apenas o organizador pode visualizar as solicitacoes',
  );
});

test('POST /solicitacoes/:id/aceitar accepts a pending request for the organizer package', async () => {
  lastViajanteCreateArgs = undefined;
  lastSolicitacaoUpdateArgs = undefined;
  const request = createRequest({ tokenSub: 42, params: { id: '31' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  await solicitacoesController.aceitar(31, readCurrentUserId(request), {});

  assert.deepEqual(lastViajanteCreateArgs, {
    data: {
      idPacoteViagem: 22,
      idUser: 8,
      statusParticipacao: 'ATIVO',
      permissao: 'VIAJANTE',
    },
  });
  assert.deepEqual((lastSolicitacaoUpdateArgs as { where: { id: number } }).where, {
    id: 31,
  });
  assert.equal(
    (lastSolicitacaoUpdateArgs as { data: { statusSolicitacao: string } }).data.statusSolicitacao,
    'ACEITA',
  );
  assert.ok(
    (lastSolicitacaoUpdateArgs as { data: { dataResposta: unknown } }).data.dataResposta instanceof Date,
  );
});

test('POST /solicitacoes/:id/rejeitar stores the rejection reason for the organizer package', async () => {
  lastSolicitacaoUpdateArgs = undefined;
  const request = createRequest({ tokenSub: 42, params: { id: '32' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  await solicitacoesController.rejeitar(32, readCurrentUserId(request), {
    motivoRecusa: 'Lotado',
  });

  assert.deepEqual((lastSolicitacaoUpdateArgs as { where: { id: number } }).where, {
    id: 32,
  });
  assert.equal(
    (lastSolicitacaoUpdateArgs as { data: { statusSolicitacao: string } }).data.statusSolicitacao,
    'REJEITADA',
  );
  assert.equal(
    (lastSolicitacaoUpdateArgs as { data: { motivoRecusa: string } }).data.motivoRecusa,
    'Lotado',
  );
  assert.ok(
    (lastSolicitacaoUpdateArgs as { data: { dataResposta: unknown } }).data.dataResposta instanceof Date,
  );
});

test('GET /pacotes/:id/detalhes hides the package from unrelated users', async () => {
  const request = createRequest({ tokenSub: 99, params: { id: '11' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  await assert.rejects(
    pacotesController.findOneForParticipant(11, readCurrentUserId(request)),
    (error: unknown) =>
      (error as { message?: string }).message === 'pacote nao encontrado para este usuario',
  );
});

test('GET /pacotes/:id/detalhes returns package data for an active traveler', async () => {
  const request = createRequest({ tokenSub: 8, params: { id: '9' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await pacotesController.findOneForParticipant(9, readCurrentUserId(request));

  assert.equal(result.id, 9);
  assert.equal(result.viewerRole, 'VIAJANTE');
});

test('GET /pacotes/:id/roteiro returns itinerary data for a participant', async () => {
  const request = createRequest({ tokenSub: 8, params: { id: '9' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await pacotesController.findItinerary(9, readCurrentUserId(request));

  assert.equal(result.packageId, 9);
  assert.equal(result.viewerRole, 'VIAJANTE');
  assert.equal(result.canEdit, false);
  assert.equal(result.roteiro.titulo, 'Roteiro principal');
  assert.equal(result.timeline.length, 3);
});

test('POST /veiculos uses the authenticated owner id', async () => {
  lastVeiculoCreateArgs = undefined;
  const request = createRequest({ tokenSub: 42 });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await veiculosController.create(readCurrentUserId(request), {
    idUserProprietario: 999,
    marca: 'Fiat',
    modelo: 'Argo',
    cor: 'Branco',
    placa: 'ABC1234',
    ano: 2022,
    capacidadePassageiros: 4,
  });

  assert.deepEqual(lastVeiculoCreateArgs, {
    data: {
      idUserProprietario: 42,
      marca: 'Fiat',
      modelo: 'Argo',
      cor: 'Branco',
      placa: 'ABC1234',
      ano: 2022,
      capacidadePassageiros: 4,
    },
  });
  assert.equal(result.idUserProprietario, 42);
});

test('POST /caronas creates a ride only for the package organizer', async () => {
  lastCaronaCreateArgs = undefined;
  const request = createRequest({ tokenSub: 42 });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await caronasController.create(readCurrentUserId(request), {
    idPacoteViagem: 10,
    idMotorista: 999,
    regrasCarona: 'Sem atrasos',
    status: 'PLANEJADA',
  });

  assert.equal(
    (lastCaronaCreateArgs as { data: { idPacoteViagem: number } }).data.idPacoteViagem,
    10,
  );
  assert.equal(
    (lastCaronaCreateArgs as { data: { idMotorista: number } }).data.idMotorista,
    42,
  );
  assert.equal(
    (lastCaronaCreateArgs as { data: { regrasCarona: string } }).data.regrasCarona,
    'Sem atrasos',
  );
  assert.equal(
    (lastCaronaCreateArgs as { data: { status: string } }).data.status,
    'PLANEJADA',
  );
  assert.equal(result.idMotorista, 42);
});

test('POST /hospedagens creates lodging data for the package organizer', async () => {
  lastHospedagemCreateArgs = undefined;
  const request = createRequest({ tokenSub: 42 });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await hospedagensController.create(readCurrentUserId(request), {
    idPacoteViagem: 10,
    nomeLocal: 'Pousada Azul',
    regrasHospedagem: 'Levar documento',
    statusReserva: 'CONFIRMADA',
  });

  assert.deepEqual(lastHospedagemCreateArgs, {
    data: {
      idPacoteViagem: 10,
      nomeLocal: 'Pousada Azul',
      regrasHospedagem: 'Levar documento',
      statusReserva: 'CONFIRMADA',
    },
  });
  assert.equal(result.nomeLocal, 'Pousada Azul');
});

test('GET /enderecos is explicitly blocked', () => {
  assert.throws(
    () => enderecosController.findAll(),
    (error: unknown) =>
      (error as { message?: string }).message === 'listagem global de enderecos desabilitada',
  );
});

test('POST /enderecos creates the address for authenticated flows', async () => {
  lastEnderecoCreateArgs = undefined;
  const request = createRequest({ tokenSub: 42 });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await enderecosController.create(readCurrentUserId(request), {
    rua: 'Rua A',
    cep: '40000000',
    cidade: 'Salvador',
    estado: 'BA',
  });

  assert.deepEqual(lastEnderecoCreateArgs, {
    data: {
      rua: 'Rua A',
      cep: '40000000',
      cidade: 'Salvador',
      estado: 'BA',
    },
  });
  assert.equal(result.cidade, 'Salvador');
});

test('POST /avaliacoes uses the authenticated user as author', async () => {
  lastAvaliacaoCreateArgs = undefined;
  const request = createRequest({ tokenSub: 8 });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await avaliacoesController.criar(
    {
      tipo: 'ORGANIZADOR',
      idPacoteViagem: 30,
      idUserAvaliado: 42,
      nota: 5,
      comentario: 'Muito bom',
    },
    readCurrentUserId(request),
  );

  assert.deepEqual(lastAvaliacaoCreateArgs, {
    data: {
      idPacoteViagem: 30,
      idUserAutor: 8,
      idUserAvaliado: 42,
      nota: 5,
      comentario: 'Muito bom',
      tipo: 'ORGANIZADOR',
    },
  });
  assert.equal(result.idUserAutor, 8);
});

test('GET /avaliacoes/pendentes/:idPacoteViagem returns pending evaluations for a participant', async () => {
  const request = createRequest({ tokenSub: 8, params: { idPacoteViagem: '30' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await avaliacoesController.listarPendentes(30, readCurrentUserId(request));

  assert.deepEqual(result, {
    avaliacoesPendentes: [
      {
        tipo: 'ORGANIZADOR',
        idUserAvaliado: 42,
      },
      {
        tipo: 'VIAJANTE',
        idUserAvaliado: 7,
      },
    ],
    pacote: {
      pendente: true,
    },
  });
});

test('POST /auth/google delegates the id token to the auth service', async () => {
  const result = await authController.google({ idToken: 'google-token' });

  assert.deepEqual(result, {
    accessToken: 'backend-google-token',
    userStatus: 'INCOMPLETE',
    userId: null,
  });
});

test('POST /auth/complete-profile uses the authenticated user email from the JWT', async () => {
  lastAuthCompleteProfileArgs = undefined;
  const request = createRequest({ tokenSub: 42 });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await authController.completeProfile(
    request as { user: { email: string; name?: string | null } },
    {
      name: 'Usuario Completo',
      cpf: '12345678901',
      phoneNumber: '71999999999',
    },
  );

  assert.deepEqual(lastAuthCompleteProfileArgs, {
    email: 'user42@example.com',
    name: null,
    body: {
      name: 'Usuario Completo',
      cpf: '12345678901',
      phoneNumber: '71999999999',
    },
  });
  assert.equal(result.user.email, 'user42@example.com');
});

test('GET /auth/me uses the authenticated email from the JWT', async () => {
  lastAuthGetProfileArgs = undefined;
  const request = createRequest({ tokenSub: 42 });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await authController.me(request as { user: { email: string } });

  assert.equal(lastAuthGetProfileArgs, 'user42@example.com');
  assert.equal(result.email, 'user42@example.com');
});

test('PATCH /auth/me forwards updates using the authenticated email', async () => {
  lastAuthUpdateProfileArgs = undefined;
  const request = createRequest({ tokenSub: 42 });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await authController.updateMe(
    request as { user: { email: string } },
    {
      sobreMim: 'Novo texto',
    },
  );

  assert.deepEqual(lastAuthUpdateProfileArgs, {
    email: 'user42@example.com',
    body: {
      sobreMim: 'Novo texto',
    },
  });
  assert.equal(result.email, 'user42@example.com');
});

test('PATCH /pacotes/:id updates the package for its organizer', async () => {
  lastPacoteUpdateArgs = undefined;
  const request = createRequest({ tokenSub: 42, params: { id: '9' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await pacotesController.update(9, readCurrentUserId(request), {
    titulo: 'Pacote atualizado',
  });

  assert.deepEqual(lastPacoteUpdateArgs, {
    where: { id: 9 },
    data: {
      titulo: 'Pacote atualizado',
    },
  });
  assert.equal(result.titulo, 'Pacote atualizado');
});

test('PATCH /pacotes/:id hides packages owned by another organizer', async () => {
  const request = createRequest({ tokenSub: 42, params: { id: '11' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  await assert.rejects(
    pacotesController.update(11, readCurrentUserId(request), {
      titulo: 'Nao deveria atualizar',
    }),
    (error: unknown) =>
      (error as { message?: string }).message === 'pacote nao encontrado para este organizador',
  );
});

test('DELETE /pacotes/:id deletes the package for its organizer', async () => {
  lastPacoteDeleteArgs = undefined;
  const request = createRequest({ tokenSub: 42, params: { id: '9' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  const result = await pacotesController.delete(9, readCurrentUserId(request));

  assert.deepEqual(lastPacoteDeleteArgs, {
    where: { id: 9 },
  });
  assert.equal(result.id, 9);
});

test('DELETE /pacotes/:id hides packages from another organizer', async () => {
  const request = createRequest({ tokenSub: 42, params: { id: '11' } });
  const context = createExecutionContext(request);

  assert.equal(jwtAuthGuard.canActivate(context), true);

  await assert.rejects(
    pacotesController.delete(11, readCurrentUserId(request)),
    (error: unknown) =>
      (error as { message?: string }).message === 'pacote nao encontrado para este organizador',
  );
});
