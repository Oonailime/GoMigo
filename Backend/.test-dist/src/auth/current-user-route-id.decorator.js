"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserRouteId = void 0;
exports.readCurrentUserRouteId = readCurrentUserRouteId;
const common_1 = require("@nestjs/common");
const current_user_id_decorator_1 = require("./current-user-id.decorator");
function readCurrentUserRouteId(request, paramName = 'id') {
    const userId = (0, current_user_id_decorator_1.readCurrentUserId)(request);
    const rawParam = request.params?.[paramName];
    const routeId = Number(rawParam);
    if (!Number.isInteger(routeId)) {
        throw new common_1.ForbiddenException(`parametro ${paramName} invalido para a rota autenticada`);
    }
    if (userId !== routeId) {
        throw new common_1.ForbiddenException('usuario nao pode acessar outro perfil por esta rota');
    }
    return routeId;
}
exports.CurrentUserRouteId = (0, common_1.createParamDecorator)((paramName, context) => {
    const request = context.switchToHttp().getRequest();
    return readCurrentUserRouteId(request, paramName);
});
