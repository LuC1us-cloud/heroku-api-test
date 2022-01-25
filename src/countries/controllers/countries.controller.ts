import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CountriesService } from '../services/countries.service';
@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) { }

  @Get('supportedCountries')
  @ApiOperation({ description: 'Get the list of supported countries' })
  @ApiOkResponse({ description: 'The list of supported countries' })
  supportedCountriesList() {
    return this.countriesService.getSupportedCountries();
  }

  @Get('groupedByMonth/:countryCode/:year')
  @ApiOperation({ description: 'Get holiday list for a specific country and year, grouped by month' })
  @ApiOkResponse({ description: 'The list of holidays grouped by month' })
  @ApiResponse({ status: 400, description: 'Invalid country code or year' })
  groupedByMonthHolidayListForCountry(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
  ) {
    return this.countriesService.getGroupedByMonthHolidayListForCountry(countryCode, year);
  }

  @Get('dayStatus/:countryCode/:year/:month/:day')
  @ApiOperation({ description: 'Get the status of a specific day' })
  @ApiOkResponse({ description: 'The status of a specific day' })
  @ApiResponse({ status: 400, description: 'Invalid country code or date' })
  specificDayStatus(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('day') day: number,
  ) {
    return this.countriesService.getSpecificDayStatus(countryCode, year, month, day);
  }

  @Get('maxFreeDays/:countryCode/:year')
  @ApiOperation({ description: 'Get the maximum number of consecutive free days in a year' })
  @ApiOkResponse({ description: 'The maximum number of consecutive free days in a year' })
  @ApiResponse({ status: 400, description: 'Invalid country code or year' })
  maxNumberOfConsecutiveFreeDays(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
  ) {
    return this.countriesService.getMaxNumberOfConsecutiveFreeDays(countryCode, year);
  }
}