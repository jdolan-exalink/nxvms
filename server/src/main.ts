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

    // Note: Routes already have 'api/v1' prefix in controller decorators
    // app.setGlobalPrefix('api/v1');  // COMMENTED OUT - routes already have it
    console.log('3. Global prefix skipped (already in controllers)');

    app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true,
      forbidNonWhitelisted: false, // Allow extra fields to be sent but not mapped to DTO
      transform: true,
    }));
    console.log('4. Validation pipe added');

    // Configure CORS - supports wildcard (*) or comma-separated list
    const corsOriginEnv = process.env.CORS_ORIGIN || '*';
    let corsConfig: any = {
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
    
    if (corsOriginEnv === '*') {
      // Wildcard: accept all origins
      corsConfig.origin = true;
    } else if (corsOriginEnv.includes(',')) {
      // Multiple origins: split and trim
      corsConfig.origin = corsOriginEnv.split(',').map(o => o.trim());
    } else {
      // Single origin
      corsConfig.origin = corsOriginEnv;
    }
    
    app.enableCors(corsConfig);
    console.log(`5. CORS enabled for: ${corsOriginEnv}`);

    // Skip Swagger for now - it's causing issues
    // TODO: Debug and re-enable Swagger module
    if (process.env.ENABLE_SWAGGER === 'true') {
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
    } else {
      console.log('6-8. Swagger disabled (ENABLE_SWAGGER env var not set)');
    }

    const port = parseInt(process.env.PORT || '3000', 10);
    console.log(`9. Starting server on port ${port}...`);
    await app.listen(port, '0.0.0.0');
    console.log(`✅ Server running on http://0.0.0.0:${port}`);
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
