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
exports.CaronasController = void 0;
const common_1 = require("@nestjs/common");
const create_carona_dto_1 = require("./dto/create-carona.dto");
const update_carona_dto_1 = require("./dto/update-carona.dto");
const current_user_id_decorator_1 = require("../auth/current-user-id.decorator");
const caronas_service_1 = require("./caronas.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let CaronasController = class CaronasController {
    constructor(caronasService) {
        this.caronasService = caronasService;
    }
    create(userId, body) {
        return this.caronasService.createForOrganizer(userId, {
            idPacoteViagem: body.idPacoteViagem,
            idVeiculo: body.idVeiculo,
            dataIda: body.dataIda,
            dataVolta: body.dataVolta,
            precoTotal: body.precoTotal,
            precoPorPessoa: body.precoPorPessoa,
            idEnderecoPartida: body.idEnderecoPartida,
            idEnderecoDestino: body.idEnderecoDestino,
            regrasCarona: body.regrasCarona,
            vagasDisponiveis: body.vagasDisponiveis,
            status: body.status,
        });
    }
    findAll(userId) {
        return this.caronasService.findByOrganizer(userId);
    }
    findOne(id, userId) {
        return this.caronasService.findOneForOrganizer(id, userId);
    }
    update(id, userId, body) {
        return this.caronasService.updateForOrganizer(id, userId, body);
    }
    delete(id, userId) {
        return this.caronasService.deleteForOrganizer(id, userId);
    }
};
exports.CaronasController = CaronasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_carona_dto_1.CreateCaronaDto]),
    __metadata("design:returntype", void 0)
], CaronasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CaronasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], CaronasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_carona_dto_1.UpdateCaronaDto]),
    __metadata("design:returntype", void 0)
], CaronasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], CaronasController.prototype, "delete", null);
exports.CaronasController = CaronasController = __decorate([
    (0, common_1.Controller)('caronas'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [caronas_service_1.CaronasService])
], CaronasController);
