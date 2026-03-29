"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = require("node:assert/strict");
const common_1 = require("@nestjs/common");
const current_user_route_id_decorator_1 = require("../src/auth/current-user-route-id.decorator");
(0, node_test_1.test)('readCurrentUserRouteId returns the route id when it matches the authenticated user', () => {
    assert.equal((0, current_user_route_id_decorator_1.readCurrentUserRouteId)({
        user: { sub: 42 },
        params: { id: '42' },
    }), 42);
});
(0, node_test_1.test)('readCurrentUserRouteId supports custom param names', () => {
    assert.equal((0, current_user_route_id_decorator_1.readCurrentUserRouteId)({
        user: { sub: 7 },
        params: { userId: '7' },
    }, 'userId'), 7);
});
(0, node_test_1.test)('readCurrentUserRouteId rejects unauthenticated requests', () => {
    assert.throws(() => (0, current_user_route_id_decorator_1.readCurrentUserRouteId)({ params: { id: '5' } }), (error) => error instanceof common_1.UnauthorizedException &&
        error.message === 'usuario sem perfil completo');
});
(0, node_test_1.test)('readCurrentUserRouteId rejects invalid route ids', () => {
    assert.throws(() => (0, current_user_route_id_decorator_1.readCurrentUserRouteId)({
        user: { sub: 5 },
        params: { id: 'abc' },
    }), (error) => error instanceof common_1.ForbiddenException &&
        error.message === 'parametro id invalido para a rota autenticada');
});
(0, node_test_1.test)('readCurrentUserRouteId rejects access to another user route', () => {
    assert.throws(() => (0, current_user_route_id_decorator_1.readCurrentUserRouteId)({
        user: { sub: 5 },
        params: { id: '9' },
    }), (error) => error instanceof common_1.ForbiddenException &&
        error.message === 'usuario nao pode acessar outro perfil por esta rota');
});
