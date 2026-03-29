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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitacoesController = void 0;
const common_1 = require("@nestjs/common");
const aceitar_solicitacao_dto_1 = require("./dto/aceitar-solicitacao.dto");
const rejeitar_solicitacao_dto_1 = require("./dto/rejeitar-solicitacao.dto");
const solicitar_participacao_dto_1 = require("./dto/solicitar-participacao.dto");
const current_user_id_decorator_1 = require("../auth/current-user-id.decorator");
const solicitacoes_service_1 = require("./solicitacoes.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let SolicitacoesController = class SolicitacoesController {
    constructor(solicitacoesService) {
        this.solicitacoesService = solicitacoesService;
    }
    solicitar(idPacoteViagem, userId, body) {
        return this.solicitacoesService.solicitarParticipacao(idPacoteViagem, userId, body);
    }
    aceitar(id, userId, _body) {
        return this.solicitacoesService.aceitarSolicitacao(id, userId);
    }
    rejeitar(id, userId, body) {
        return this.solicitacoesService.rejeitarSolicitacao(id, userId, body.motivoRecusa);
    }
    findByPacote(idPacoteViagem, userId) {
        return this.solicitacoesService.findByPacote(idPacoteViagem, userId);
    }
    findMine(userId) {
        return this.solicitacoesService.findMine(userId);
    }
    getNotifications(userId) {
        return this.solicitacoesService.getNotifications(userId);
    }
    findOne(id, userId) {
        return this.solicitacoesService.findOneForUser(id, userId);
    }
};
exports.SolicitacoesController = SolicitacoesController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/pacote/:idPacoteViagem'),
    __param(0, (0, common_1.Param)('idPacoteViagem', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, solicitar_participacao_dto_1.SolicitarParticipacaoDto]),
    __metadata("design:returntype", void 0)
], SolicitacoesController.prototype, "solicitar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/aceitar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, aceitar_solicitacao_dto_1.AceitarSolicitacaoDto]),
    __metadata("design:returntype", void 0)
], SolicitacoesController.prototype, "aceitar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/rejeitar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, rejeitar_solicitacao_dto_1.RejeitarSolicitacaoDto]),
    __metadata("design:returntype", void 0)
], SolicitacoesController.prototype, "rejeitar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/pacote/:idPacoteViagem'),
    __param(0, (0, common_1.Param)('idPacoteViagem', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SolicitacoesController.prototype, "findByPacote", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('minhas'),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SolicitacoesController.prototype, "findMine", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('notificacoes'),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SolicitacoesController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SolicitacoesController.prototype, "findOne", null);
exports.SolicitacoesController = SolicitacoesController = __decorate([
    (0, common_1.Controller)('solicitacoes'),
    __metadata("design:paramtypes", [solicitacoes_service_1.SolicitacoesService])
], SolicitacoesController);
