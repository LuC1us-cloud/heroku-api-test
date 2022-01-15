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
    async availableCountriesList(): Promise<object> {
        const response = await fetch('https://kayaposoft.com/enrico/json/v2.0/?action=getSupportedCountries');
        const jsonResponse = await response.json();
        // iterate over the array of countries and return each countries fullName and countryCode
        const countries = jsonResponse.map(country => {
            return {
                fullName: country.fullName,
                countryCode: country.countryCode,
            };
        });
        return countries;
    }

    @Get('grouped/:countryCode/:year')
    async groupedByMonthHolidayListForCountry(@Param() params: string[]): Promise<object> {
        const countryCode = params['countryCode'];
        const year = params['year'];
        const response = await fetch(`https://kayaposoft.com/enrico/json/v2.0?action=getHolidaysForYear&year=${year}&country=${countryCode}&holidayType=public_holiday`);
        const jsonResponse = await response.json();
        if(jsonResponse.error) return jsonResponse;
        // map response to reduce clutter of information
        const freeDays = jsonResponse.map(day => {
            return {
                date: day.date.day,
                month: day.date.month,
                name: day.name[0].text,
                holidayType: day.holidayType,
            };
        });
        // group free days by month
        const groupedDays = freeDays.reduce((year, day) => {
            const month = day.month;
            if(!year[month]) {
                year[month] = [];
            }
            year[month].push(day);
            return year;
        }, {});
        return groupedDays;
    }

    @Get('day/:countryCode/:year/:month/:day')
    async specificDayStatus(@Param() params: string[]): Promise<object> {
        const countryCode = params['countryCode'];
        const year = parseInt(params['year']);
        var month = parseInt(params['month']);
        var day = parseInt(params['day']);
        // some data validation
        if(!year || !month || !day) return { error: 'Invalid date' };
        if(month > 12 || month < 1) return { error: 'Invalid month' };
        // check if the day is a valid day of the month
        if(day > new Date(year, month, 0).getDate() || day < 1) return { error: 'Invalid day' };
        // if validation passes, month becomes 0-indexed
        month -= 1;
        
        if(false){
            // will query database later
            return;
        }else{
            // create a date with the given year, month and day
            const dayOfWeek = new Date(year, month, day).getDay();
            // if it is a saturday or a sunday, return status as 'free day'
            if(dayOfWeek === 0 || dayOfWeek === 6) return { status: 'free day' };
            return { status: 'work day' };
        }
    }

    @Get('maxFreeDays/:countryCode/:year')
    async maximumNumberOfConsecutiveFreeDays(@Param() params: string[]): Promise<object> {
        const countryCode = params['countryCode'];
        const year = params['year'];
        const response = await fetch(`https://kayaposoft.com/enrico/json/v2.0?action=getHolidaysForYear&year=${year}&country=${countryCode}&holidayType=public_holiday`);
        const jsonResponse = await response.json();
        if(jsonResponse.error) return jsonResponse;
        // iterate over the array of holidays and return a list of free days
        const freeDaysList = jsonResponse.map(day => {
            // for some reason day needs to be +1 to get the correct day?
            // otherwise date 2020-01-01 will jump to 2019-12-31
            return new Date(year, day.date.month-1, day.date.day+1);
        });
        // max number of consecutive free days
        var maxNumber = 0;
        // current number of consecutive free days, used for tracking current max
        var currentNumber = 0;
        // iterate over the list of free days and check if they are consecutive
        for(var i = 0; i < freeDaysList.length - 1; i++) {
            const currentFreeDay = freeDaysList[i];
            const nextFreeDay = freeDaysList[i+1];
            if(getDifferenceInDays(currentFreeDay, nextFreeDay) === 1) currentNumber++;
            // if the next free day is not consecutive, reset the current number
            else currentNumber = 0;

            // if the current number of consecutive free days is greater than the current max, update the max
            if(currentNumber > maxNumber) maxNumber = currentNumber;
        }

        return { 
            maxConsecutiveFreeDays: maxNumber,
            freeDays: freeDaysList 
        };
    }   
}

// helper function to get the difference between two dates in days
function getDifferenceInDays(date1, date2) {
    var diff = date2.getTime() - date1.getTime();
    return diff / (1000 * 60 * 60 * 24);
}
