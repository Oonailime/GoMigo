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
exports.HospedagensController = void 0;
const common_1 = require("@nestjs/common");
const current_user_id_decorator_1 = require("../auth/current-user-id.decorator");
const create_hospedagem_dto_1 = require("./dto/create-hospedagem.dto");
const update_hospedagem_dto_1 = require("./dto/update-hospedagem.dto");
const hospedagens_service_1 = require("./hospedagens.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let HospedagensController = class HospedagensController {
    constructor(hospedagensService) {
        this.hospedagensService = hospedagensService;
    }
    create(userId, body) {
        return this.hospedagensService.createForOrganizer(userId, body);
    }
    findAll(userId) {
        return this.hospedagensService.findByOrganizer(userId);
    }
    findOne(id, userId) {
        return this.hospedagensService.findOneForOrganizer(id, userId);
    }
    update(id, userId, body) {
        return this.hospedagensService.updateForOrganizer(id, userId, body);
    }
    delete(id, userId) {
        return this.hospedagensService.deleteForOrganizer(id, userId);
    }
};
exports.HospedagensController = HospedagensController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_hospedagem_dto_1.CreateHospedagemDto]),
    __metadata("design:returntype", void 0)
], HospedagensController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HospedagensController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], HospedagensController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_hospedagem_dto_1.UpdateHospedagemDto]),
    __metadata("design:returntype", void 0)
], HospedagensController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], HospedagensController.prototype, "delete", null);
exports.HospedagensController = HospedagensController = __decorate([
    (0, common_1.Controller)('hospedagens'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [hospedagens_service_1.HospedagensService])
], HospedagensController);
