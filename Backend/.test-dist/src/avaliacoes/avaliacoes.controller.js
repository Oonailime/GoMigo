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
exports.AvaliacoesController = void 0;
const common_1 = require("@nestjs/common");
const criar_avaliacao_dto_1 = require("./dto/criar-avaliacao.dto");
const avaliacoes_service_1 = require("./avaliacoes.service");
const current_user_id_decorator_1 = require("../auth/current-user-id.decorator");
const jwt_guard_1 = require("../auth/jwt.guard");
let AvaliacoesController = class AvaliacoesController {
    constructor(avaliacoesService) {
        this.avaliacoesService = avaliacoesService;
    }
    criar(body, userId) {
        return this.avaliacoesService.criar({
            ...body,
            idUserAutor: userId,
        });
    }
    listarPendentes(idPacoteViagem, userId) {
        return this.avaliacoesService.listarPendentes(idPacoteViagem, userId);
    }
};
exports.AvaliacoesController = AvaliacoesController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_avaliacao_dto_1.CriarAvaliacaoDto, Number]),
    __metadata("design:returntype", void 0)
], AvaliacoesController.prototype, "criar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('pendentes/:idPacoteViagem'),
    __param(0, (0, common_1.Param)('idPacoteViagem', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AvaliacoesController.prototype, "listarPendentes", null);
exports.AvaliacoesController = AvaliacoesController = __decorate([
    (0, common_1.Controller)('avaliacoes'),
    __metadata("design:paramtypes", [avaliacoes_service_1.AvaliacoesService])
], AvaliacoesController);
