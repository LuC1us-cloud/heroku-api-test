import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HolidayEntity } from './models/holiday.entity';
import { Holiday } from './models/holiday.interface';
import { Year } from './models/year.interface';
import fetch from 'node-fetch';
import { CountriesService } from './services/countries.service';

@Injectable()
export class GetDataMiddleware implements NestMiddleware {
    constructor(private readonly countriesService: CountriesService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        // get countryCode and year variables from request parameters
        const countryCode: string = req.params.countryCode;
        const year: number = parseInt(req.params.year);

        // temp data variable
        let data: Holiday[];
        // check if the country and year is stored in the db
        let queryResult: Year = await this.countriesService.findYear(countryCode, year);

        // if data is already in db return it
        if (queryResult) {
            // cast the data to Holiday from HolidayEntity
            data = queryResult.holidays.map((holiday) => {
                return {
                    day: holiday.day,
                    month: holiday.month,
                    name: holiday.name,
                    holidayType: holiday.holidayType,
                } as Holiday;
            });

            // I am attaching the data to the request object so that it can be used in the controller
            // not sure if this is the correct way, but using res.locals breaks the request chain
            // because response can only be edited once, and then the request times out
            req.body.data = data;
            next();

        } else {
            // if data is not in db, fetch it from the API
            const response = await fetch(
                `https://kayaposoft.com/enrico/json/v2.0?action=getHolidaysForYear&year=${year}&country=${countryCode}`,
            );
            const jsonResponse = await response.json();
            // if error was returned from API return it
            if (jsonResponse.error) throw new HttpException(jsonResponse.error, 400);

            // map response to format information
            data = jsonResponse.map((holiday: { date: { day: number; month: number; }; name: { text: string; }[]; holidayType: string; }) => {
                return {
                    day: holiday.date.day,
                    month: holiday.date.month,
                    name: holiday.name[0].text,
                    holidayType: holiday.holidayType,
                } as Holiday;
            });

            let dbInsertData: Year = {
                countryCode: countryCode,
                year: year,
                holidays: data,
            };

            await this.countriesService.createYear(dbInsertData);

            // if everything went well return the formatted data
            data = data.map((holiday: HolidayEntity) => {
                return {
                    day: holiday.day,
                    month: holiday.month,
                    name: holiday.name,
                    holidayType: holiday.holidayType,
                } as Holiday;
            });

            req.body.data = data;
            next();
        }
    }
}