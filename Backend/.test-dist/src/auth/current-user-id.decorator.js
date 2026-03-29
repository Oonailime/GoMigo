"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserId = void 0;
exports.readCurrentUserId = readCurrentUserId;
const common_1 = require("@nestjs/common");
function readCurrentUserId(request) {
    const userId = request.user?.sub;
    if (!userId) {
        throw new common_1.UnauthorizedException('usuario sem perfil completo');
    }
    return userId;
}
exports.CurrentUserId = (0, common_1.createParamDecorator)((_data, context) => {
    const request = context.switchToHttp().getRequest();
    return readCurrentUserId(request);
});
