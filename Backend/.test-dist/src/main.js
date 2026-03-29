"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const dotenv_1 = require("dotenv");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const security_middleware_1 = require("./security.middleware");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)(__dirname, '..', '.env') });
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    const trustProxy = process.env.TRUST_PROXY?.trim();
    const frontendUrl = process.env.FRONTEND_URL?.split(',').map((value) => value.trim()).filter(Boolean);
    if (!frontendUrl || frontendUrl.length === 0) {
        throw new Error('FRONTEND_URL deve ser configurado para inicializar a API com CORS seguro');
    }
    if (trustProxy) {
        app.getHttpAdapter().getInstance().set('trust proxy', trustProxy === 'true' ? 1 : trustProxy);
    }
    app.use(security_middleware_1.securityMiddleware);
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const port = Number(process.env.PORT ?? 3001);
    await app.listen(port);
}
bootstrap();
