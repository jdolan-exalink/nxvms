import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, ExceptionFilter } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('1. Starting NestJS application...');
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    console.log('2. App created, setting up routes...');

    app.setGlobalPrefix('api/v1');
    console.log('3. Global prefix set');

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    console.log('4. Validation pipe added');

    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    console.log('5. CORS enabled');

    try {
      const config = new DocumentBuilder()
        .setTitle('NXvms API')
        .setDescription('The NXvms (NX-like Video Management System) API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      console.log('6. Swagger config built');

      const document = SwaggerModule.createDocument(app, config);
      console.log('7. Swagger document created');

      SwaggerModule.setup('api/docs', app, document);
      console.log('8. Swagger route set up');
    } catch (swaggerErr) {
      console.warn('⚠️  Swagger setup failed (non-blocking):', swaggerErr.message);
    }

    const port = parseInt(process.env.PORT || '3000', 10);
    console.log(`9. Starting server on port ${port}...`);
    await app.listen(port, '0.0.0.0');
    console.log(`✅ Server running on http://0.0.0.0:${port}`);
    console.log(`📚 API Docs available at http://localhost:${port}/api/docs`);
  } catch (err) {
    console.error('❌ Bootstrap failed:', err);
    if (err instanceof Error) {
      console.error('Message:', err.message);
      console.error('Stack:', err.stack);
    }
    process.exit(1);
  }
}

bootstrap();
