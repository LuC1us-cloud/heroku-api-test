import { Module } from '@nestjs/common';
import { CountriesService } from './services/countries.service';
import { CountriesController } from './controllers/countries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from './models/country.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CountryEntity])
  ],
  providers: [CountriesService],
  controllers: [CountriesController]
})
export class CountriesModule {}
