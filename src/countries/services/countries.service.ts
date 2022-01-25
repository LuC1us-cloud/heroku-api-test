import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HolidayEntity } from '../models/holiday.entity';
import { Holiday } from '../models/holiday.interface';
import { YearEntity } from '../models/year.entity';
import { Year } from '../models/year.interface';
import fetch from 'node-fetch';
import { Country } from '../models/country.interface';
import { Data } from '../models/data.interface';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(YearEntity)
    private readonly yearRepository: Repository<YearEntity>,
    @InjectRepository(HolidayEntity)
    private readonly holidayRepository: Repository<HolidayEntity>,
  ) { }

  // Not gonna make this method save country info, because the list could change on the API provider side
  // and there would be no way of knowing, without calling the same API again.
  // tldr: making this method save responses from API would not make sense.
  async getSupportedCountries(): Promise<Country[]> {
    const response = await fetch(
      'https://kayaposoft.com/enrico/json/v2.0/?action=getSupportedCountries',
    );
    const jsonResponse = await response.json();
    // iterate over the array of countries and return each countries fullName and countryCode
    let countries: Country[] = jsonResponse.map((country: { fullName: string; countryCode: string; }) => {
      return {
        fullName: country.fullName,
        countryCode: country.countryCode,
      } as Country;
    });
    return countries;
  }
  async getGroupedByMonthHolidayListForCountry(countryCode: string, year: number): Promise<object> {
    const data: Data = await this.getData(countryCode, year);

    // if API responded with an error, return the error
    if (data.error) return { error: data.error };

    // group free days by month
    const groupedDays = data.holidays.reduce((year: { [month: number]: Holiday[]; }, day: Holiday) => {
      const month: number = day.month;
      if (!year[month]) {
        year[month] = [];
      }
      year[month].push(day);
      return year;
    }, {});
    return groupedDays;
  }
  async getSpecificDayStatus(countryCode: string, year: number, month: number, day: number): Promise<object> {
    // some data validation
    if (!year || !month || !day) return { error: 'Invalid date' };
    if (month > 12 || month < 1) return { error: 'Invalid month' };
    if (day > new Date(year, month, 0).getDate() || day < 1)
      return { error: 'Invalid day' };

    const data = await this.getData(countryCode, year);
    // if API responded with an error, return the error
    if (data.error) return { error: data.error };

    // check if the day is in the holiday list
    const specificDay = data.holidays.find(
      (holiday: { day: number; month: number; }) => holiday.day == day && holiday.month == month,
    );
    if (specificDay) return { status: specificDay.holidayType };

    // create a date with the given year, month and day
    const dayOfWeek: number = new Date(year, month - 1, day).getDay();
    // if it is a saturday or a sunday, return status as 'free day'
    if (dayOfWeek === 0 || dayOfWeek === 6) return { status: 'free_day' };
    // otherwise it is a weekday, return status as 'work day'
    return { status: 'work_day' };
  }

  async getMaxNumberOfConsecutiveFreeDays(countryCode: string, year: number): Promise<object> {
    const data = await this.getData(countryCode, year);
    // if API responded with an error, return the error
    if (data.error) return { error: data.error };

    // iterate over the array of holidays and return a list in Date format
    const freeDaysList = data.holidays.map((holiday: { month: number; day: number; }) => {
      // for some reason day needs to be +1 to get the correct day?
      // otherwise date 2020-01-01 will jump to 2019-12-31
      return new Date(year, holiday.month - 1, holiday.day + 1);
    });

    // max number of consecutive free days
    var maxFreeDayCount = 1;
    // current number of consecutive free days, used for tracking current max
    var currentFreeDayCount = 1;
    // iterate over the list of free days and check if they are consecutive
    for (var i = 0; i < freeDaysList.length - 1; i++) {
      const currentFreeDay = freeDaysList[i];
      const nextFreeDay = freeDaysList[i + 1];
      if (this.getDifferenceInDays(currentFreeDay, nextFreeDay) === 1)
        currentFreeDayCount++;
      // if the next free day is not consecutive (difference == 1), reset the current number
      else currentFreeDayCount = 1;
      // if the current number of consecutive free days is greater than the current max, update the max
      if (currentFreeDayCount > maxFreeDayCount)
        maxFreeDayCount = currentFreeDayCount;
    }

    return {
      maxConsecutiveFreeDays: maxFreeDayCount,
    };
  }

  async getData(countryCode: string, year: number): Promise<Data> {
    // temp data variable
    let data: Data = {
      holidays: undefined,
      error: undefined
    }
    // check if the country and year is stored in the db
    let queryResult: Year = await this.yearRepository.findOne({ countryCode, year }, { relations: ['holidays'] });

    // if data is already in db return it
    if (queryResult) {
      // cast the data to Holiday from HolidayEntity
      data.holidays = queryResult.holidays.map((holiday) => {
        return {
          day: holiday.day,
          month: holiday.month,
          name: holiday.name,
          holidayType: holiday.holidayType,
        } as Holiday;
      });

      return data;
    }

    // if data is not in db, fetch it from the API
    const response = await fetch(
      `https://kayaposoft.com/enrico/json/v2.0?action=getHolidaysForYear&year=${year}&country=${countryCode}`,
    );
    const jsonResponse = await response.json();
    // if error was returned from API return it
    if (jsonResponse.error) {
      data.error = jsonResponse.error;
      return data;
    }
    console.log(data);

    // map response to format information
    data.holidays = jsonResponse.map((holiday: { date: { day: number; month: number; }; name: { text: string; }[]; holidayType: string; }) => {
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
      holidays: data.holidays,
    };

    // insert holidays into db, then insert the year connected to the holidays
    await this.holidayRepository.save(dbInsertData.holidays);
    await this.yearRepository.save(dbInsertData);

    // if everything went well return the formatted data
    data.holidays = data.holidays.map((holiday: HolidayEntity) => {
      return {
        day: holiday.day,
        month: holiday.month,
        name: holiday.name,
        holidayType: holiday.holidayType,
      } as Holiday;
    });

    return data;
  }

  // helper function to get the difference between two dates in days
  getDifferenceInDays(date1: Date, date2: Date): number {
    var diff = date2.getTime() - date1.getTime();
    return diff / (1000 * 60 * 60 * 24);
  }
}
