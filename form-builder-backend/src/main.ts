import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // your React frontend
    // origin: process.env.FRONTEND_URL || 'http://192.168.0.105:5173', // your React frontend
    credentials: true,
  });

  // ✅ Helmet adds extra security headers
  app.use(helmet());

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', // Access via http://localhost:4000/uploads/filename.png
  });

  // ✅ Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Form Builder API')
    .setDescription('API documentation for Form Builder system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ✅ Start the NestJS server
  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);

  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`👉 Swagger docs: http://localhost:${PORT}/api/docs`);
  console.log(`📂 Uploads served from: http://localhost:${PORT}/uploads/`);
}

bootstrap();
