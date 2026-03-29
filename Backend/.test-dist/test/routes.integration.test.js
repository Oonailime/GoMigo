"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const anuncios_controller_1 = require("../src/anuncios/anuncios.controller");
const anuncios_service_1 = require("../src/anuncios/anuncios.service");
const auth_controller_1 = require("../src/auth/auth.controller");
const auth_service_1 = require("../src/auth/auth.service");
const avaliacoes_controller_1 = require("../src/avaliacoes/avaliacoes.controller");
const avaliacoes_service_1 = require("../src/avaliacoes/avaliacoes.service");
const caronas_controller_1 = require("../src/caronas/caronas.controller");
const caronas_service_1 = require("../src/caronas/caronas.service");
const enderecos_controller_1 = require("../src/enderecos/enderecos.controller");
const enderecos_service_1 = require("../src/enderecos/enderecos.service");
const hospedagens_controller_1 = require("../src/hospedagens/hospedagens.controller");
const hospedagens_service_1 = require("../src/hospedagens/hospedagens.service");
const current_user_id_decorator_1 = require("../src/auth/current-user-id.decorator");
const current_user_route_id_decorator_1 = require("../src/auth/current-user-route-id.decorator");
const jwt_guard_1 = require("../src/auth/jwt.guard");
const pacotes_controller_1 = require("../src/pacotes/pacotes.controller");
const pacotes_service_1 = require("../src/pacotes/pacotes.service");
const prisma_service_1 = require("../src/prisma/prisma.service");
const solicitacoes_controller_1 = require("../src/solicitacoes/solicitacoes.controller");
const solicitacoes_service_1 = require("../src/solicitacoes/solicitacoes.service");
const users_controller_1 = require("../src/users/users.controller");
const users_service_1 = require("../src/users/users.service");
const veiculos_controller_1 = require("../src/veiculos/veiculos.controller");
const veiculos_service_1 = require("../src/veiculos/veiculos.service");
let originalJwtSecret;
let lastAnuncioCreateArgs;
let lastAnuncioUpdateArgs;
let lastAnuncioDeleteArgs;
let lastPacoteUpdateArgs;
let lastPacoteDeleteArgs;
let lastViajanteCreateArgs;
let lastSolicitacaoUpdateArgs;
let lastVeiculoCreateArgs;
let lastCaronaCreateArgs;
let lastHospedagemCreateArgs;
let lastEnderecoCreateArgs;
let lastAvaliacaoCreateArgs;
let lastAuthCompleteProfileArgs;
let lastAuthGetProfileArgs;
let lastAuthUpdateProfileArgs;
const prismaMock = {
    user: {
        findUnique: async ({ where }) => {
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
        update: async ({ where, data }) => ({
            id: where.id,
            ...data,
        }),
        delete: async ({ where }) => ({ id: where.id }),
    },
    pacoteViagem: {
        findUnique: async ({ where }) => {
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
        update: async ({ where, data }) => {
            lastPacoteUpdateArgs = { where, data };
            return {
                id: where.id,
                ...data,
            };
        },
        delete: async ({ where }) => {
            lastPacoteDeleteArgs = { where };
            return { id: where.id };
        },
        findMany: async () => [],
        count: async () => 0,
    },
    anuncioPacote: {
        create: async (args) => {
            lastAnuncioCreateArgs = args;
            return { id: 99, ...args.data };
        },
        findMany: async () => [],
        findUnique: async ({ where }) => {
            if (where.id === 99) {
                return { id: 99, idOrganizador: 42 };
            }
            return null;
        },
        update: async ({ where, data }) => {
            lastAnuncioUpdateArgs = { where, data };
            return {
                id: where.id,
                ...data,
            };
        },
        delete: async ({ where }) => {
            lastAnuncioDeleteArgs = { where };
            return { id: where.id };
        },
    },
    veiculo: {
        create: async (args) => {
            lastVeiculoCreateArgs = args;
            return { id: 701, ...args.data };
        },
        findMany: async () => [],
        findUnique: async ({ where }) => {
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
        update: async ({ where, data }) => ({
            id: where.id,
            ...data,
        }),
        delete: async ({ where }) => ({ id: where.id }),
    },
    endereco: {
        create: async (args) => {
            lastEnderecoCreateArgs = args;
            return { id: 801, ...args.data };
        },
        findMany: async () => [],
        findUnique: async ({ where }) => {
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
        update: async ({ where, data }) => ({
            id: where.id,
            ...data,
        }),
        delete: async ({ where }) => ({ id: where.id }),
        findFirst: async () => null,
    },
    solicitacaoParticipacao: {
        create: async (args) => ({ id: 1, ...args.data }),
        findUnique: async ({ where }) => {
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
        update: async (args) => {
            lastSolicitacaoUpdateArgs = args;
            return args;
        },
    },
    viajante: {
        findUnique: async ({ where }) => {
            const key = where.idPacoteViagem_idUser;
            if ((key.idPacoteViagem === 30 && key.idUser === 8) ||
                (key.idPacoteViagem === 30 && key.idUser === 7)) {
                return {
                    idPacoteViagem: key.idPacoteViagem,
                    idUser: key.idUser,
                    statusParticipacao: 'ATIVO',
                };
            }
            return null;
        },
        count: async () => 0,
        create: async (args) => {
            lastViajanteCreateArgs = args;
            return args;
        },
        delete: async () => ({ success: true }),
        findMany: async ({ where } = {}) => {
            if (where?.idPacoteViagem === 30 && where?.statusParticipacao === 'ATIVO') {
                return [{ idUser: 7 }, { idUser: 8 }];
            }
            return [];
        },
    },
    avaliacao: {
        create: async (args) => {
            lastAvaliacaoCreateArgs = args;
            return { id: 901, ...args.data };
        },
        findFirst: async () => null,
        groupBy: async () => [],
        findMany: async ({ where } = {}) => {
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
        findMany: async ({ where }) => {
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
        create: async (args) => {
            lastCaronaCreateArgs = args;
            return { id: 401, ...args.data };
        },
        findMany: async ({ where }) => {
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
        findUnique: async ({ where }) => {
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
        update: async ({ where, data }) => ({
            id: where.id,
            ...data,
        }),
        delete: async ({ where }) => ({ id: where.id }),
    },
    hospedagem: {
        create: async (args) => {
            lastHospedagemCreateArgs = args;
            return { id: 501, ...args.data };
        },
        findMany: async ({ where }) => {
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
        findUnique: async ({ where }) => {
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
        update: async ({ where, data }) => ({
            id: where.id,
            ...data,
        }),
        delete: async ({ where }) => ({ id: where.id }),
    },
    $transaction: async (fn) => fn(prismaMock),
};
let usersController;
let anunciosController;
let authController;
let avaliacoesController;
let caronasController;
let enderecosController;
let hospedagensController;
let solicitacoesController;
let pacotesController;
let veiculosController;
let jwtAuthGuard;
const authServiceMock = {
    handleGoogleLogin: async (idToken) => ({
        accessToken: `backend-${idToken}`,
        userStatus: 'INCOMPLETE',
        userId: null,
    }),
    completeProfile: async (email, name, body) => {
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
    getProfile: async (email) => {
        lastAuthGetProfileArgs = email;
        return {
            id: 1,
            email,
            name: 'Perfil',
        };
    },
    updateProfile: async (email, body) => {
        lastAuthUpdateProfileArgs = { email, body };
        return {
            id: 1,
            email,
            ...body,
        };
    },
};
function createBearerToken(sub) {
    return jwt.sign({
        sub,
        email: `user${sub}@example.com`,
    }, process.env.BACKEND_JWT_SECRET);
}
function createRequest({ tokenSub, params, } = {}) {
    return {
        headers: tokenSub !== undefined ? { authorization: `Bearer ${createBearerToken(tokenSub)}` } : {},
        params,
    };
}
function createExecutionContext(request) {
    return {
        switchToHttp: () => ({
            getRequest: () => request,
        }),
    };
}
(0, node_test_1.before)(async () => {
    originalJwtSecret = process.env.BACKEND_JWT_SECRET;
    process.env.BACKEND_JWT_SECRET = 'integration-test-secret';
    const moduleRef = await testing_1.Test.createTestingModule({
        controllers: [
            users_controller_1.UsersController,
            anuncios_controller_1.AnunciosController,
            auth_controller_1.AuthController,
            avaliacoes_controller_1.AvaliacoesController,
            caronas_controller_1.CaronasController,
            enderecos_controller_1.EnderecosController,
            hospedagens_controller_1.HospedagensController,
            solicitacoes_controller_1.SolicitacoesController,
            pacotes_controller_1.PacotesController,
            veiculos_controller_1.VeiculosController,
        ],
        providers: [
            users_service_1.UsersService,
            anuncios_service_1.AnunciosService,
            avaliacoes_service_1.AvaliacoesService,
            caronas_service_1.CaronasService,
            enderecos_service_1.EnderecosService,
            hospedagens_service_1.HospedagensService,
            solicitacoes_service_1.SolicitacoesService,
            pacotes_service_1.PacotesService,
            veiculos_service_1.VeiculosService,
            jwt_guard_1.JwtAuthGuard,
            {
                provide: auth_service_1.AuthService,
                useValue: authServiceMock,
            },
            {
                provide: prisma_service_1.PrismaService,
                useValue: prismaMock,
            },
        ],
    }).compile();
    usersController = moduleRef.get(users_controller_1.UsersController);
    anunciosController = moduleRef.get(anuncios_controller_1.AnunciosController);
    authController = moduleRef.get(auth_controller_1.AuthController);
    avaliacoesController = moduleRef.get(avaliacoes_controller_1.AvaliacoesController);
    caronasController = moduleRef.get(caronas_controller_1.CaronasController);
    enderecosController = moduleRef.get(enderecos_controller_1.EnderecosController);
    hospedagensController = moduleRef.get(hospedagens_controller_1.HospedagensController);
    solicitacoesController = moduleRef.get(solicitacoes_controller_1.SolicitacoesController);
    pacotesController = moduleRef.get(pacotes_controller_1.PacotesController);
    veiculosController = moduleRef.get(veiculos_controller_1.VeiculosController);
    jwtAuthGuard = moduleRef.get(jwt_guard_1.JwtAuthGuard);
});
(0, node_test_1.after)(() => {
    process.env.BACKEND_JWT_SECRET = originalJwtSecret;
});
(0, node_test_1.test)('GET /users/:id returns 403 when the route id does not match the authenticated user', () => {
    const request = createRequest({ tokenSub: 1, params: { id: '2' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    assert.throws(() => (0, current_user_route_id_decorator_1.readCurrentUserRouteId)(request), (error) => error.message === 'usuario nao pode acessar outro perfil por esta rota');
});
(0, node_test_1.test)('GET /users/:id returns the profile when the authenticated user matches the route id', async () => {
    const request = createRequest({ tokenSub: 1, params: { id: '1' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const user = await usersController.findOne((0, current_user_route_id_decorator_1.readCurrentUserRouteId)(request));
    assert.equal(user.id, 1);
    assert.equal(user.email, 'user@example.com');
});
(0, node_test_1.test)('POST /anuncios rejects requests without a bearer token', () => {
    const request = createRequest();
    const context = createExecutionContext(request);
    assert.throws(() => jwtAuthGuard.canActivate(context), (error) => error instanceof common_1.UnauthorizedException && error.message === 'token ausente');
});
(0, node_test_1.test)('POST /anuncios uses the authenticated organizer id', async () => {
    lastAnuncioCreateArgs = undefined;
    const request = createRequest({ tokenSub: 42 });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await anunciosController.create((0, current_user_id_decorator_1.readCurrentUserId)(request), {
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
(0, node_test_1.test)('PATCH /anuncios/:id blocks updates from another organizer', async () => {
    const request = createRequest({ tokenSub: 7, params: { id: '99' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    await assert.rejects(anunciosController.update((0, current_user_id_decorator_1.readCurrentUserId)(request), 99, {
        tituloAnuncio: 'Nao deveria alterar',
    }), (error) => error.message === 'somente o organizador do anuncio pode altera-lo');
});
(0, node_test_1.test)('PATCH /anuncios/:id updates when the organizer owns the anuncio', async () => {
    lastAnuncioUpdateArgs = undefined;
    const request = createRequest({ tokenSub: 42, params: { id: '99' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await anunciosController.update((0, current_user_id_decorator_1.readCurrentUserId)(request), 99, {
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
(0, node_test_1.test)('DELETE /anuncios/:id deletes when the organizer owns the anuncio', async () => {
    lastAnuncioDeleteArgs = undefined;
    const request = createRequest({ tokenSub: 42, params: { id: '99' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await anunciosController.delete((0, current_user_id_decorator_1.readCurrentUserId)(request), 99);
    assert.deepEqual(lastAnuncioDeleteArgs, {
        where: { id: 99 },
    });
    assert.equal(result.id, 99);
});
(0, node_test_1.test)('GET /solicitacoes/pacote/:id rejects non-organizers', async () => {
    const request = createRequest({ tokenSub: 12, params: { idPacoteViagem: '21' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    await assert.rejects(solicitacoesController.findByPacote(21, (0, current_user_id_decorator_1.readCurrentUserId)(request)), (error) => error.message === 'apenas o organizador pode visualizar as solicitacoes');
});
(0, node_test_1.test)('POST /solicitacoes/:id/aceitar accepts a pending request for the organizer package', async () => {
    lastViajanteCreateArgs = undefined;
    lastSolicitacaoUpdateArgs = undefined;
    const request = createRequest({ tokenSub: 42, params: { id: '31' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    await solicitacoesController.aceitar(31, (0, current_user_id_decorator_1.readCurrentUserId)(request), {});
    assert.deepEqual(lastViajanteCreateArgs, {
        data: {
            idPacoteViagem: 22,
            idUser: 8,
            statusParticipacao: 'ATIVO',
            permissao: 'VIAJANTE',
        },
    });
    assert.deepEqual(lastSolicitacaoUpdateArgs.where, {
        id: 31,
    });
    assert.equal(lastSolicitacaoUpdateArgs.data.statusSolicitacao, 'ACEITA');
    assert.ok(lastSolicitacaoUpdateArgs.data.dataResposta instanceof Date);
});
(0, node_test_1.test)('POST /solicitacoes/:id/rejeitar stores the rejection reason for the organizer package', async () => {
    lastSolicitacaoUpdateArgs = undefined;
    const request = createRequest({ tokenSub: 42, params: { id: '32' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    await solicitacoesController.rejeitar(32, (0, current_user_id_decorator_1.readCurrentUserId)(request), {
        motivoRecusa: 'Lotado',
    });
    assert.deepEqual(lastSolicitacaoUpdateArgs.where, {
        id: 32,
    });
    assert.equal(lastSolicitacaoUpdateArgs.data.statusSolicitacao, 'REJEITADA');
    assert.equal(lastSolicitacaoUpdateArgs.data.motivoRecusa, 'Lotado');
    assert.ok(lastSolicitacaoUpdateArgs.data.dataResposta instanceof Date);
});
(0, node_test_1.test)('GET /pacotes/:id/detalhes hides the package from unrelated users', async () => {
    const request = createRequest({ tokenSub: 99, params: { id: '11' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    await assert.rejects(pacotesController.findOneForParticipant(11, (0, current_user_id_decorator_1.readCurrentUserId)(request)), (error) => error.message === 'pacote nao encontrado para este usuario');
});
(0, node_test_1.test)('GET /pacotes/:id/detalhes returns package data for an active traveler', async () => {
    const request = createRequest({ tokenSub: 8, params: { id: '9' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await pacotesController.findOneForParticipant(9, (0, current_user_id_decorator_1.readCurrentUserId)(request));
    assert.equal(result.id, 9);
    assert.equal(result.viewerRole, 'VIAJANTE');
});
(0, node_test_1.test)('GET /pacotes/:id/roteiro returns itinerary data for a participant', async () => {
    const request = createRequest({ tokenSub: 8, params: { id: '9' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await pacotesController.findItinerary(9, (0, current_user_id_decorator_1.readCurrentUserId)(request));
    assert.equal(result.packageId, 9);
    assert.equal(result.viewerRole, 'VIAJANTE');
    assert.equal(result.canEdit, false);
    assert.equal(result.roteiro.titulo, 'Roteiro principal');
    assert.equal(result.timeline.length, 3);
});
(0, node_test_1.test)('POST /veiculos uses the authenticated owner id', async () => {
    lastVeiculoCreateArgs = undefined;
    const request = createRequest({ tokenSub: 42 });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await veiculosController.create((0, current_user_id_decorator_1.readCurrentUserId)(request), {
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
(0, node_test_1.test)('POST /caronas creates a ride only for the package organizer', async () => {
    lastCaronaCreateArgs = undefined;
    const request = createRequest({ tokenSub: 42 });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await caronasController.create((0, current_user_id_decorator_1.readCurrentUserId)(request), {
        idPacoteViagem: 10,
        idMotorista: 999,
        regrasCarona: 'Sem atrasos',
        status: 'PLANEJADA',
    });
    assert.equal(lastCaronaCreateArgs.data.idPacoteViagem, 10);
    assert.equal(lastCaronaCreateArgs.data.idMotorista, 42);
    assert.equal(lastCaronaCreateArgs.data.regrasCarona, 'Sem atrasos');
    assert.equal(lastCaronaCreateArgs.data.status, 'PLANEJADA');
    assert.equal(result.idMotorista, 42);
});
(0, node_test_1.test)('POST /hospedagens creates lodging data for the package organizer', async () => {
    lastHospedagemCreateArgs = undefined;
    const request = createRequest({ tokenSub: 42 });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await hospedagensController.create((0, current_user_id_decorator_1.readCurrentUserId)(request), {
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
(0, node_test_1.test)('GET /enderecos is explicitly blocked', () => {
    assert.throws(() => enderecosController.findAll(), (error) => error.message === 'listagem global de enderecos desabilitada');
});
(0, node_test_1.test)('POST /enderecos creates the address for authenticated flows', async () => {
    lastEnderecoCreateArgs = undefined;
    const request = createRequest({ tokenSub: 42 });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await enderecosController.create((0, current_user_id_decorator_1.readCurrentUserId)(request), {
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
(0, node_test_1.test)('POST /avaliacoes uses the authenticated user as author', async () => {
    lastAvaliacaoCreateArgs = undefined;
    const request = createRequest({ tokenSub: 8 });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await avaliacoesController.criar({
        tipo: 'ORGANIZADOR',
        idPacoteViagem: 30,
        idUserAvaliado: 42,
        nota: 5,
        comentario: 'Muito bom',
    }, (0, current_user_id_decorator_1.readCurrentUserId)(request));
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
(0, node_test_1.test)('GET /avaliacoes/pendentes/:idPacoteViagem returns pending evaluations for a participant', async () => {
    const request = createRequest({ tokenSub: 8, params: { idPacoteViagem: '30' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await avaliacoesController.listarPendentes(30, (0, current_user_id_decorator_1.readCurrentUserId)(request));
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
(0, node_test_1.test)('POST /auth/google delegates the id token to the auth service', async () => {
    const result = await authController.google({ idToken: 'google-token' });
    assert.deepEqual(result, {
        accessToken: 'backend-google-token',
        userStatus: 'INCOMPLETE',
        userId: null,
    });
});
(0, node_test_1.test)('POST /auth/complete-profile uses the authenticated user email from the JWT', async () => {
    lastAuthCompleteProfileArgs = undefined;
    const request = createRequest({ tokenSub: 42 });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await authController.completeProfile(request, {
        name: 'Usuario Completo',
        cpf: '12345678901',
        phoneNumber: '71999999999',
    });
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
(0, node_test_1.test)('GET /auth/me uses the authenticated email from the JWT', async () => {
    lastAuthGetProfileArgs = undefined;
    const request = createRequest({ tokenSub: 42 });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await authController.me(request);
    assert.equal(lastAuthGetProfileArgs, 'user42@example.com');
    assert.equal(result.email, 'user42@example.com');
});
(0, node_test_1.test)('PATCH /auth/me forwards updates using the authenticated email', async () => {
    lastAuthUpdateProfileArgs = undefined;
    const request = createRequest({ tokenSub: 42 });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await authController.updateMe(request, {
        sobreMim: 'Novo texto',
    });
    assert.deepEqual(lastAuthUpdateProfileArgs, {
        email: 'user42@example.com',
        body: {
            sobreMim: 'Novo texto',
        },
    });
    assert.equal(result.email, 'user42@example.com');
});
(0, node_test_1.test)('PATCH /pacotes/:id updates the package for its organizer', async () => {
    lastPacoteUpdateArgs = undefined;
    const request = createRequest({ tokenSub: 42, params: { id: '9' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await pacotesController.update(9, (0, current_user_id_decorator_1.readCurrentUserId)(request), {
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
(0, node_test_1.test)('PATCH /pacotes/:id hides packages owned by another organizer', async () => {
    const request = createRequest({ tokenSub: 42, params: { id: '11' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    await assert.rejects(pacotesController.update(11, (0, current_user_id_decorator_1.readCurrentUserId)(request), {
        titulo: 'Nao deveria atualizar',
    }), (error) => error.message === 'pacote nao encontrado para este organizador');
});
(0, node_test_1.test)('DELETE /pacotes/:id deletes the package for its organizer', async () => {
    lastPacoteDeleteArgs = undefined;
    const request = createRequest({ tokenSub: 42, params: { id: '9' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    const result = await pacotesController.delete(9, (0, current_user_id_decorator_1.readCurrentUserId)(request));
    assert.deepEqual(lastPacoteDeleteArgs, {
        where: { id: 9 },
    });
    assert.equal(result.id, 9);
});
(0, node_test_1.test)('DELETE /pacotes/:id hides packages from another organizer', async () => {
    const request = createRequest({ tokenSub: 42, params: { id: '11' } });
    const context = createExecutionContext(request);
    assert.equal(jwtAuthGuard.canActivate(context), true);
    await assert.rejects(pacotesController.delete(11, (0, current_user_id_decorator_1.readCurrentUserId)(request)), (error) => error.message === 'pacote nao encontrado para este organizador');
});
