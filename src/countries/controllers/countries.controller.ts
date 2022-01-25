import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { Country } from '../models/country.interface';
import { CountriesService } from '../services/countries.service';
@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) { }

  @Get('supportedCountries')
  @ApiOkResponse({ description: 'The list of supported countries' })
  supportedCountriesList(): object {
    return this.countriesService.getSupportedCountries();
  }

  @Get('groupedByMonth/:countryCode/:year')
  @ApiOkResponse({ description: 'The list of holidays grouped by month' })
  @ApiResponse({ status: 400, description: 'Invalid country code or year' })
  groupedByMonthHolidayListForCountry(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
  ): object {
    return this.countriesService.getGroupedByMonthHolidayListForCountry(countryCode, year);
  }

  @Get('dayStatus/:countryCode/:year/:month/:day')
  @ApiOkResponse({ description: 'The status of a specific day' })
  @ApiResponse({ status: 400, description: 'Invalid country code or date' })
  specificDayStatus(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('day') day: number,
  ): object {
    return this.countriesService.getSpecificDayStatus(countryCode, year, month, day);
  }

  @Get('maxFreeDays/:countryCode/:year')
  @ApiOkResponse({ description: 'The maximum number of consecutive free days in a year' })
  @ApiResponse({ status: 400, description: 'Invalid country code or year' })
  maxNumberOfConsecutiveFreeDays(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
  ): object {
    return this.countriesService.getMaxNumberOfConsecutiveFreeDays(countryCode, year);
  }
}