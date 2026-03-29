"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaronasModule = void 0;
const common_1 = require("@nestjs/common");
const caronas_controller_1 = require("./caronas.controller");
const caronas_service_1 = require("./caronas.service");
let CaronasModule = class CaronasModule {
};
exports.CaronasModule = CaronasModule;
exports.CaronasModule = CaronasModule = __decorate([
    (0, common_1.Module)({
        controllers: [caronas_controller_1.CaronasController],
        providers: [caronas_service_1.CaronasService],
    })
], CaronasModule);
