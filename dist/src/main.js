"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const nestjs_api_reference_1 = require("@scalar/nestjs-api-reference");
const app_module_1 = require("./app.module");
const prisma_exception_filter_1 = require("./common/filters/prisma-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ["error", "warn", "log", "debug", "verbose"],
    });
    app.setGlobalPrefix("api/v1", {
        exclude: ["Health"],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new prisma_exception_filter_1.PrismaExceptionFilter());
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3003",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8000",
        "https://daily-checkin-six.vercel.app",
        process.env.FRONTEND_URL,
    ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin) ||
                origin.endsWith(".vercel.app") ||
                origin.endsWith(".leapcell.dev")) {
                callback(null, true);
            }
            else {
                callback(null, false);
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Twilio-Signature", "X-Country"],
        exposedHeaders: ["Content-Disposition"],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle("DB Royal API V1")
        .setDescription("DB Royal API v1 for photography service with country-based multi-tenancy. Use X-Country header (NG or UK) to scope requests to a specific region.")
        .setVersion("1.0")
        .addBearerAuth()
        .addApiKey({
        type: "apiKey",
        name: "X-Country",
        in: "header",
        description: "Country code for multi-tenancy (NG for Nigeria, UK for United Kingdom). Defaults to NG if not provided. Use this header to scope all operations to a specific country.",
    }, "X-Country")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api", app, document, {
        jsonDocumentUrl: "openapi.json",
    });
    app.use("/docs", (0, nestjs_api_reference_1.apiReference)({
        theme: "default",
        url: "/openapi.json",
    }));
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map