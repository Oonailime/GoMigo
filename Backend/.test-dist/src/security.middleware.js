"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = securityMiddleware;
const buckets = new Map();
function getClientIp(request) {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
        return forwarded.split(',')[0]?.trim() ?? request.ip ?? 'unknown';
    }
    return request.ip ?? request.socket.remoteAddress ?? 'unknown';
}
function resolveRateLimit(pathname, method) {
    if (pathname === '/api/auth/google' && method === 'POST') {
        return { windowMs: 60_000, max: 15 };
    }
    if (pathname.startsWith('/api/auth/') && method !== 'GET') {
        return { windowMs: 60_000, max: 20 };
    }
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
        return { windowMs: 60_000, max: 120 };
    }
    return null;
}
function securityMiddleware(request, response, next) {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    response.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    response.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    const rateLimit = resolveRateLimit(request.path, request.method.toUpperCase());
    if (!rateLimit) {
        next();
        return;
    }
    const now = Date.now();
    const key = `${request.method}:${request.path}:${getClientIp(request)}`;
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
        buckets.set(key, {
            count: 1,
            resetAt: now + rateLimit.windowMs,
        });
        response.setHeader('X-RateLimit-Limit', String(rateLimit.max));
        response.setHeader('X-RateLimit-Remaining', String(rateLimit.max - 1));
        next();
        return;
    }
    current.count += 1;
    buckets.set(key, current);
    response.setHeader('X-RateLimit-Limit', String(rateLimit.max));
    response.setHeader('X-RateLimit-Remaining', String(Math.max(0, rateLimit.max - current.count)));
    if (current.count > rateLimit.max) {
        response.setHeader('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
        response.status(429).json({
            message: 'limite de requisicoes excedido, tente novamente em instantes',
        });
        return;
    }
    next();
}
