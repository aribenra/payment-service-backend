import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScrapingModule } from './scraping/scraping.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Service } from './scraping/entities/service.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('HOST') || 'localhost',
        port: parseInt(configService.get<string>('PG_PORT') || '5432', 10),
        username: configService.get<string>('DB_USER') || 'postgres',
        password: configService.get<string>('PSW') || 'bingo',
        database: configService.get<string>('DATABASE') || 'servicios_husares',
        entities: [Service],
        synchronize: true,
        ssl: configService.get<string>('SSL') === 'true',
        extra: {
          ssl: configService.get<string>('SSL') === 'true' ? { rejectUnauthorized: false } : null,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Service]),
    ScrapingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
