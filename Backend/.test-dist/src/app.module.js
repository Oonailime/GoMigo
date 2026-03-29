"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const enderecos_module_1 = require("./enderecos/enderecos.module");
const veiculos_module_1 = require("./veiculos/veiculos.module");
const pacotes_module_1 = require("./pacotes/pacotes.module");
const solicitacoes_module_1 = require("./solicitacoes/solicitacoes.module");
const hospedagens_module_1 = require("./hospedagens/hospedagens.module");
const caronas_module_1 = require("./caronas/caronas.module");
const avaliacoes_module_1 = require("./avaliacoes/avaliacoes.module");
const anuncios_module_1 = require("./anuncios/anuncios.module");
const auth_module_1 = require("./auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            enderecos_module_1.EnderecosModule,
            veiculos_module_1.VeiculosModule,
            pacotes_module_1.PacotesModule,
            solicitacoes_module_1.SolicitacoesModule,
            hospedagens_module_1.HospedagensModule,
            caronas_module_1.CaronasModule,
            avaliacoes_module_1.AvaliacoesModule,
            anuncios_module_1.AnunciosModule,
            auth_module_1.AuthModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
