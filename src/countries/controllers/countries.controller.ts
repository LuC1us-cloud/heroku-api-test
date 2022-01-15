import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Country } from '../models/country.interface';
import { CountriesService } from '../services/countries.service';

@Controller('countries')
export class CountriesController {
    constructor(private countriesService: CountriesService) {}

    @Post()
    create(@Body() country: Country): Observable<Country> {
        return this.countriesService.createCountry(country);
    }

    @Get('findAll')
    findAll(): Observable<Country[]> {
        return this.countriesService.findAll();
    }

    @Get()
    findOne(@Param('id') id: number): Observable<Country> {
        return this.countriesService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id') id: number,
        @Body() country: Country
        ): Observable<UpdateResult> {
        return this.countriesService.update(id, country);
    }   

    @Delete(':id')
    delete(@Param('id') id: number): Observable<DeleteResult> {
        return this.countriesService.delete(id);
    }
}
