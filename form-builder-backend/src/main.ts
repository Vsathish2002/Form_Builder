import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for your React app
  app.enableCors({
    // origin: ' http://192.168.0.105:5173', // your Vite React frontend
    origin: 'http://localhost:5173', // your Vite React frontend
    credentials: true, // allow cookies and headers
  });

  // ✅ Helmet for security
  app.use(helmet());

  // ✅ Swagger setup
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
  // console.log(`🚀 Server running at  http://192.168.0.105:${PORT}`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
}
bootstrap();
