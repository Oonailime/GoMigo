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
exports.AnunciosController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt.guard");
const current_user_id_decorator_1 = require("../auth/current-user-id.decorator");
const create_anuncio_dto_1 = require("./dto/create-anuncio.dto");
const update_anuncio_dto_1 = require("./dto/update-anuncio.dto");
const anuncios_service_1 = require("./anuncios.service");
let AnunciosController = class AnunciosController {
    constructor(anunciosService) {
        this.anunciosService = anunciosService;
    }
    create(userId, body) {
        return this.anunciosService.create(userId, body);
    }
    findAll() {
        return this.anunciosService.findAll();
    }
    findOne(id) {
        return this.anunciosService.findOne(id);
    }
    update(userId, id, body) {
        return this.anunciosService.update(userId, id, body);
    }
    delete(userId, id) {
        return this.anunciosService.delete(userId, id);
    }
};
exports.AnunciosController = AnunciosController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_anuncio_dto_1.CreateAnuncioDto]),
    __metadata("design:returntype", void 0)
], AnunciosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnunciosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AnunciosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_anuncio_dto_1.UpdateAnuncioDto]),
    __metadata("design:returntype", void 0)
], AnunciosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AnunciosController.prototype, "delete", null);
exports.AnunciosController = AnunciosController = __decorate([
    (0, common_1.Controller)('anuncios'),
    __metadata("design:paramtypes", [anuncios_service_1.AnunciosService])
], AnunciosController);
