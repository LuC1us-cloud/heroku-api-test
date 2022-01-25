import { Controller, Get, Param } from '@nestjs/common';
import { Country } from '../models/country.interface';
import { CountriesService } from '../services/countries.service';
@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) { }

  @Get('supportedCountries')
  supportedCountriesList(): object {
    return this.countriesService.getSupportedCountries();
  }

  @Get('groupedByMonth/:countryCode/:year')
  groupedByMonthHolidayListForCountry(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
  ): object {
    return this.countriesService.getGroupedByMonthHolidayListForCountry(countryCode, year);
  }

  @Get('dayStatus/:countryCode/:year/:month/:day')
  specificDayStatus(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('day') day: number,
  ): object {
    return this.countriesService.getSpecificDayStatus(countryCode, year, month, day);
  }

  @Get('maxFreeDays/:countryCode/:year')
  maxNumberOfConsecutiveFreeDays(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
  ): object {
    return this.countriesService.getMaxNumberOfConsecutiveFreeDays(countryCode, year);
  }
}