import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { logger } from '../common/middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Countries API')
    .setDescription('Documentation for the Countries API')
    .setVersion('1.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // a request logger, so i can see when you check my API :)
  app.use(logger);
  await app.listen(parseInt(process.env.PORT) || 3000);
}
console.log('Server running on port 3000');
bootstrap();
