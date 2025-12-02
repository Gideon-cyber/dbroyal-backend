import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  app.setGlobalPrefix("api/v1", {
    exclude: ["Health"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  // Enable CORS
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3003",
    "http://localhost:5173", // Vite default
    "http://localhost:5174",
    "http://localhost:8000",
    "https://daily-checkin-six.vercel.app", // Production frontend
    process.env.FRONTEND_URL, // Custom frontend URL
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or curl)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list or matches Vercel preview deployments
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".leapcell.dev")
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Twilio-Signature",
      "X-Country",
    ],
    exposedHeaders: ["Content-Disposition"],
  });

  const config = new DocumentBuilder()
    .setTitle("DB Royal API V1")
    .setDescription(
      "DB Royal API v1 for photography service with country-based multi-tenancy. Use X-Country header (NG or UK) to scope requests to a specific region."
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addApiKey(
      {
        type: "apiKey",
        name: "X-Country",
        in: "header",
        description:
          "Country code for multi-tenancy (NG for Nigeria, UK for United Kingdom). Defaults to NG if not provided. Use this header to scope all operations to a specific country.",
      },
      "X-Country"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    jsonDocumentUrl: "openapi.json",
  });

  app.use(
    "/docs",
    apiReference({
      theme: "default",
      url: "/openapi.json",
    })
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
