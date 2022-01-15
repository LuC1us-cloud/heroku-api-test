import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Country } from '../models/country.interface';
import { CountriesService } from '../services/countries.service';
import fetch from 'node-fetch';
@Controller('countries')
export class CountriesController {
    constructor(private countriesService: CountriesService) {}

    @Get('list')
    // Not gonna make this method save country info, because the list could change on the API provider side 
    // and there would be no way of without calling the same API again.
    // tldr: making this method save responses from API would not save any time.
    async availableCountriesList(): Promise<Observable<Country>> {
        const response = await fetch('https://kayaposoft.com/enrico/json/v2.0/?action=getSupportedCountries');
        const json = await response.json();
        // iterate over the array of countries and return each countries fullName and countryCode
        const countries = json.map(country => {
            return {
                fullName: country.fullName,
                countryCode: country.countryCode,
            };
        });
        return countries;
    }

    @Get('grouped/:country/:year')
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
