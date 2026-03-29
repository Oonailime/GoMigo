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
exports.EnderecosController = void 0;
const common_1 = require("@nestjs/common");
const current_user_id_decorator_1 = require("../auth/current-user-id.decorator");
const create_endereco_dto_1 = require("./dto/create-endereco.dto");
const update_endereco_dto_1 = require("./dto/update-endereco.dto");
const enderecos_service_1 = require("./enderecos.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let EnderecosController = class EnderecosController {
    constructor(enderecosService) {
        this.enderecosService = enderecosService;
    }
    create(_userId, body) {
        return this.enderecosService.create(body);
    }
    findAll() {
        throw new common_1.ForbiddenException('listagem global de enderecos desabilitada');
    }
    findOne(_userId, id) {
        return this.enderecosService.findOne(id);
    }
    update(_userId, _id, _body) {
        throw new common_1.ForbiddenException('alteracao direta de endereco desabilitada');
    }
    delete(_userId, _id) {
        throw new common_1.ForbiddenException('remocao direta de endereco desabilitada');
    }
};
exports.EnderecosController = EnderecosController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_endereco_dto_1.CreateEnderecoDto]),
    __metadata("design:returntype", void 0)
], EnderecosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnderecosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], EnderecosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_endereco_dto_1.UpdateEnderecoDto]),
    __metadata("design:returntype", void 0)
], EnderecosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], EnderecosController.prototype, "delete", null);
exports.EnderecosController = EnderecosController = __decorate([
    (0, common_1.Controller)('enderecos'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [enderecos_service_1.EnderecosService])
], EnderecosController);
