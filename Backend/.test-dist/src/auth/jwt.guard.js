"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
let JwtAuthGuard = class JwtAuthGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'] ?? request.headers['Authorization'];
        if (!authHeader || typeof authHeader !== 'string') {
            throw new common_1.UnauthorizedException('token ausente');
        }
        const [scheme, token] = authHeader.split(' ');
        if (scheme !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('token invalido');
        }
        const secret = process.env.BACKEND_JWT_SECRET;
        if (!secret) {
            throw new common_1.UnauthorizedException('jwt secret nao configurado');
        }
        try {
            const decoded = jwt.verify(token, secret);
            if (!decoded || typeof decoded === 'string') {
                throw new common_1.UnauthorizedException('token invalido');
            }
            const payload = decoded;
            if (!payload.email) {
                throw new common_1.UnauthorizedException('token invalido');
            }
            const normalizedSub = payload.sub === null || payload.sub === undefined
                ? null
                : typeof payload.sub === 'number'
                    ? payload.sub
                    : Number(payload.sub);
            if (payload.sub !== null && payload.sub !== undefined && Number.isNaN(normalizedSub)) {
                throw new common_1.UnauthorizedException('token invalido');
            }
            request.user = {
                ...payload,
                sub: normalizedSub,
            };
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('token invalido');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
