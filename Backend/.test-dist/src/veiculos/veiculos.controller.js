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
exports.VeiculosController = void 0;
const common_1 = require("@nestjs/common");
const create_veiculo_dto_1 = require("./dto/create-veiculo.dto");
const update_veiculo_dto_1 = require("./dto/update-veiculo.dto");
const current_user_id_decorator_1 = require("../auth/current-user-id.decorator");
const veiculos_service_1 = require("./veiculos.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let VeiculosController = class VeiculosController {
    constructor(veiculosService) {
        this.veiculosService = veiculosService;
    }
    create(userId, body) {
        return this.veiculosService.createForOwner(userId, {
            marca: body.marca,
            modelo: body.modelo,
            cor: body.cor,
            placa: body.placa,
            ano: body.ano,
            capacidadePassageiros: body.capacidadePassageiros,
        });
    }
    findAll(userId) {
        return this.veiculosService.findByOwner(userId);
    }
    findOne(id, userId) {
        return this.veiculosService.findOneForOwner(id, userId);
    }
    update(id, userId, body) {
        return this.veiculosService.updateForOwner(id, userId, body);
    }
    delete(id, userId) {
        return this.veiculosService.deleteForOwner(id, userId);
    }
};
exports.VeiculosController = VeiculosController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_veiculo_dto_1.CreateVeiculoDto]),
    __metadata("design:returntype", void 0)
], VeiculosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeiculosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], VeiculosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_veiculo_dto_1.UpdateVeiculoDto]),
    __metadata("design:returntype", void 0)
], VeiculosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], VeiculosController.prototype, "delete", null);
exports.VeiculosController = VeiculosController = __decorate([
    (0, common_1.Controller)('veiculos'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [veiculos_service_1.VeiculosService])
], VeiculosController);
