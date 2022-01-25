import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CountriesService } from './services/countries.service';
import { CountriesController } from './controllers/countries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YearEntity } from './models/year.entity';
import { HolidayEntity } from './models/holiday.entity';
import { GetDataMiddleware } from './data.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([YearEntity]),
    TypeOrmModule.forFeature([HolidayEntity]),
  ],
  providers: [CountriesService],
  controllers: [CountriesController]
})
export class CountriesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetDataMiddleware)
      .exclude({ path: 'api/countries/supportedCountries', method: RequestMethod.GET })
      .forRoutes(CountriesController);
  }
}
