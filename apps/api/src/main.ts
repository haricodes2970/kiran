import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { validateRuntimeEnvironment } from './config/env-validation';
import { PrismaService } from './prisma/prisma.service';
import { ensurePostgresAvailable } from './prisma/embedded-pg';
import { seedDatabase } from '../prisma/seed';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  validateRuntimeEnvironment();

  // Ensure PostgreSQL (external or embedded PGlite in dev) is listening before Prisma connects
  await ensurePostgresAvailable();

  const app = await NestFactory.create(AppModule, { rawBody: true });
  configureApp(app);
  app.enableShutdownHooks();
  await app.init();

  // If running in demo/dev mode and database has 0 categories, auto-seed demo records once
  if (process.env.NODE_ENV !== 'production' && process.env.DEMO_MODE !== 'false') {
    const prisma = app.get(PrismaService);
    const count = await prisma.category.count();
    if (count === 0) {
      logger.log('Empty development database detected; seeding demo dataset...');
      await seedDatabase(prisma);
      logger.log('Demo dataset seeded.');
    }
  }

  const port = Number(process.env.API_PORT || 4000);
  await app.listen(port, '0.0.0.0');
  logger.log(`Kiran's Infotech API listening on http://localhost:${port}/api/v1`);
  logger.log(`Swagger OpenAPI docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
