import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Allow frontend access
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.use(helmet());

  // ✅ Serve the uploads folder statically
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // ✅ Swagger setup (keep your existing)
  const config = new DocumentBuilder()
    .setTitle('Form Builder API')
    .setDescription('API documentation for Form Builder system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
}
bootstrap();
