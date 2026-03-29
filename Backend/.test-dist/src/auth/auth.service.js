"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const google_auth_library_1 = require("google-auth-library");
const jwt = require("jsonwebtoken");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    async findProfileByEmail(email) {
        const [user] = await this.prisma.$queryRaw(client_1.Prisma.sql `
      SELECT
        id,
        name,
        cpf,
        "phoneNumber",
        email,
        status,
        "sobreMim",
        personalidade,
        "experienciaViagem",
        "gostaDeFazer"
      FROM "tbUser"
      WHERE email = ${email}
      LIMIT 1
    `);
        return user ?? null;
    }
    constructor(prisma) {
        this.prisma = prisma;
        const clientId = process.env.GOOGLE_CLIENT_ID;
        this.googleClient = clientId ? new google_auth_library_1.OAuth2Client(clientId) : null;
    }
    issueAccessToken(data) {
        const secret = process.env.BACKEND_JWT_SECRET;
        if (!secret) {
            throw new Error('BACKEND_JWT_SECRET nao configurado');
        }
        return jwt.sign({
            sub: data.userId,
            email: data.email,
            name: data.name,
            status: data.userStatus,
        }, secret, { expiresIn: '7d' });
    }
    async handleGoogleLogin(idToken) {
        if (!idToken) {
            throw new common_1.BadRequestException('idToken obrigatorio');
        }
        if (!this.googleClient || !process.env.GOOGLE_CLIENT_ID) {
            throw new common_1.UnauthorizedException('GOOGLE_CLIENT_ID nao configurado');
        }
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload?.email) {
                throw new common_1.UnauthorizedException('token invalido');
            }
            const user = await this.prisma.user.findUnique({
                where: { email: payload.email },
            });
            const userStatus = user ? 'ACTIVE' : 'INCOMPLETE';
            const accessToken = this.issueAccessToken({
                userId: user?.id ?? null,
                email: payload.email,
                name: payload.name ?? null,
                userStatus,
            });
            return { accessToken, userStatus, userId: user?.id ?? null };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('falha ao validar autenticacao Google');
        }
    }
    async completeProfile(email, defaultName, data) {
        if (!email) {
            throw new common_1.BadRequestException('email invalido');
        }
        if (!data?.cpf || !data?.phoneNumber) {
            throw new common_1.BadRequestException('cpf e phoneNumber obrigatorios');
        }
        const existing = await this.prisma.user.findUnique({ where: { email } });
        const user = existing ??
            (await this.prisma.user.create({
                data: {
                    name: data.name ?? defaultName ?? 'Usuario',
                    cpf: data.cpf,
                    phoneNumber: data.phoneNumber,
                    email,
                    status: 'ATIVO',
                },
            }));
        const accessToken = this.issueAccessToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            userStatus: 'ACTIVE',
        });
        return {
            accessToken,
            userStatus: 'ACTIVE',
            user,
        };
    }
    async getProfile(email) {
        if (!email) {
            throw new common_1.BadRequestException('email invalido');
        }
        const user = await this.findProfileByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('usuario nao encontrado');
        }
        const [ratingSummary, avaliacoesRecebidas] = await Promise.all([
            this.prisma.avaliacao.aggregate({
                where: {
                    idUserAvaliado: user.id,
                },
                _avg: {
                    nota: true,
                },
                _count: {
                    _all: true,
                },
            }),
            this.prisma.avaliacao.findMany({
                where: {
                    idUserAvaliado: user.id,
                },
                orderBy: {
                    dataAvaliacao: 'desc',
                },
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
            ...user,
            ratingMedia: ratingSummary._avg.nota ?? null,
            totalAvaliacoes: ratingSummary._count._all,
            avaliacoesRecebidas,
        };
    }
    async updateProfile(email, data) {
        if (!email) {
            throw new common_1.BadRequestException('email invalido');
        }
        const user = await this.getProfile(email);
        if (!user) {
            throw new common_1.UnauthorizedException('usuario nao encontrado');
        }
        const [updated] = await this.prisma.$queryRaw(client_1.Prisma.sql `
      UPDATE "tbUser"
      SET
        name = ${data.name ?? user.name},
        cpf = ${data.cpf ?? user.cpf},
        "phoneNumber" = ${data.phoneNumber ?? user.phoneNumber},
        "sobreMim" = ${data.sobreMim ?? user.sobreMim},
        personalidade = ${data.personalidade ?? user.personalidade},
        "experienciaViagem" = ${data.experienciaViagem ?? user.experienciaViagem},
        "gostaDeFazer" = ${data.gostaDeFazer ?? user.gostaDeFazer}
      WHERE email = ${email}
      RETURNING
        id,
        name,
        cpf,
        "phoneNumber",
        email,
        status,
        "sobreMim",
        personalidade,
        "experienciaViagem",
        "gostaDeFazer"
    `);
        return updated;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
