import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for your React frontend (Form Builder UI)
  app.enableCors({
    // origin: ' http://192.168.0.105:5173',
    origin: 'http://localhost:5173',
    credentials: true, // allow cookies, authorization headers, etc.
  });

  // ✅ Helmet adds extra security headers for the API
  app.use(helmet());

  // ✅ Swagger setup for auto-generating API documentation
  // Why use Swagger here?
  // 👉 This section registers Swagger globally for your NestJS app.
  // 👉 It scans all your controllers and DTOs to build interactive API docs.
  // 👉 Developers can easily test, explore, and understand your endpoints.
  const config = new DocumentBuilder()
    .setTitle('Form Builder API') // Title for Swagger UI
    .setDescription('API documentation for Form Builder system') // Short API description
    .setVersion('1.0') // Version of your API
    .addBearerAuth() // Enables JWT auth button in Swagger UI
    .build();

  // Create Swagger document based on app structure
  const document = SwaggerModule.createDocument(app, config);

  // Expose Swagger UI at this route (http://localhost:4000/api/docs)
  SwaggerModule.setup('api/docs', app, document);

  // ✅ Start the NestJS server
  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  // console.log(`🚀 Server running at  http://192.168.0.105:${PORT}`);
  console.log(`👉 http://localhost:${PORT}/api/docs`);
}
bootstrap();
