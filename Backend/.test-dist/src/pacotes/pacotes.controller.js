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
exports.PacotesController = void 0;
const common_1 = require("@nestjs/common");
const current_user_id_decorator_1 = require("../auth/current-user-id.decorator");
const create_pacote_dto_1 = require("./dto/create-pacote.dto");
const upsert_roteiro_dto_1 = require("./dto/upsert-roteiro.dto");
const update_pacote_dto_1 = require("./dto/update-pacote.dto");
const search_pacotes_dto_1 = require("./dto/search-pacotes.dto");
const pacotes_service_1 = require("./pacotes.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let PacotesController = class PacotesController {
    constructor(pacotesService) {
        this.pacotesService = pacotesService;
    }
    create(userId, body) {
        return this.pacotesService.create({
            ...body,
            idOrganizador: userId,
        });
    }
    findAll() {
        return this.pacotesService.findAll();
    }
    findMine(userId) {
        return this.pacotesService.findByOrganizador(userId);
    }
    findMyTrips(userId) {
        return this.pacotesService.findTripsForUser(userId);
    }
    findOneForManagement(id, userId) {
        return this.pacotesService.findOneForOrganizador(id, userId);
    }
    findOneForParticipant(id, userId) {
        return this.pacotesService.findOneForParticipant(id, userId);
    }
    findItinerary(id, userId) {
        return this.pacotesService.findItineraryForParticipant(id, userId);
    }
    upsertItinerary(id, userId, body) {
        return this.pacotesService.upsertItinerary(id, userId, body);
    }
    search(query) {
        return this.pacotesService.search(query);
    }
    listarAnunciados() {
        return this.pacotesService.listarAnunciados();
    }
    findOne(id, userId) {
        return this.pacotesService.findOneForParticipant(id, userId);
    }
    async update(id, userId, body) {
        return this.pacotesService.updateForOrganizador(id, userId, body);
    }
    delete(id, userId) {
        return this.pacotesService.deleteForOrganizador(id, userId);
    }
    cancelReservation(id, userId) {
        return this.pacotesService.cancelReservation(id, userId);
    }
};
exports.PacotesController = PacotesController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_pacote_dto_1.CreatePacoteDto]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('meus'),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "findMine", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('minhas-viagens'),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "findMyTrips", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/gerenciar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "findOneForManagement", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/detalhes'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "findOneForParticipant", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/roteiro'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "findItinerary", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/roteiro'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, upsert_roteiro_dto_1.UpsertRoteiroDto]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "upsertItinerary", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_pacotes_dto_1.SearchPacotesDto]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('anunciados'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "listarAnunciados", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_pacote_dto_1.UpdatePacoteDto]),
    __metadata("design:returntype", Promise)
], PacotesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)(':id/reserva'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PacotesController.prototype, "cancelReservation", null);
exports.PacotesController = PacotesController = __decorate([
    (0, common_1.Controller)('pacotes'),
    __metadata("design:paramtypes", [pacotes_service_1.PacotesService])
], PacotesController);
