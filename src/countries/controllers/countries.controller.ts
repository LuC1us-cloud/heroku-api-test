import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Country } from '../models/country.interface';
import { CountriesService } from '../services/countries.service';

@Controller('countries')
export class CountriesController {
    constructor(private countriesService: CountriesService) {}

    @Get('list')
    availableCountriesList(@Body() country: Country): Observable<Country> {
        return this.countriesService.createCountry(country);
    }

    @Get('grouped')
    groupedByMonthHolidayListForCountry(): Observable<Country[]> {
        return this.countriesService.findAll();
    }

    @Get('day/:country/:year/:day')
    specificDayStatus(@Param('id') id: number): Observable<Country> {
        return this.countriesService.findOne(id);
    }

    @Get('maxFreeDays/:country/:year')
    maximumNumberOfConsecutiveFreeDays(
        @Param('id') id: number,
        @Body() country: Country
        ): Observable<UpdateResult> {
        return this.countriesService.update(id, country);
    }   
}
