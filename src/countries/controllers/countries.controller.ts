import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService } from '../services/countries.service';
@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) { }

  @Get('supportedCountries')
  async supportedCountriesList(): Promise<object> {
    return this.countriesService.getSupportedCountries();
  }

  @Get('groupedByMonth/:countryCode/:year')
  async groupedByMonthHolidayListForCountry(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
  ): Promise<object> {
    return this.countriesService.getGroupedByMonthHolidayListForCountry(countryCode, year);
  }

  @Get('dayStatus/:countryCode/:year/:month/:day')
  async specificDayStatus(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('day') day: number,
  ): Promise<object> {
    return this.countriesService.getSpecificDayStatus(countryCode, year, month, day);
  }

  @Get('maxFreeDays/:countryCode/:year')
  async maxNumberOfConsecutiveFreeDays(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
  ): Promise<object> {
    return this.countriesService.getMaxNumberOfConsecutiveFreeDays(countryCode, year);
  }
}