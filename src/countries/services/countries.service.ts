import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HolidayEntity } from '../models/holiday.entity';
import { Holiday } from '../models/holiday.interface';
import { YearEntity } from '../models/year.entity';
import { Year } from '../models/year.interface';
import fetch from 'node-fetch';
import { Country } from '../models/country.interface';

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

  async getGroupedByMonthHolidayListForCountry(data: Holiday[]): Promise<object> {
    // group free days by month
    const groupedDays = data.reduce((year: { [month: number]: Holiday[]; }, day: Holiday) => {
      const month: number = day.month;
      if (!year[month]) {
        year[month] = [];
      }
      year[month].push(day);
      return year;
    }, {});
    return groupedDays;
  }

  async getSpecificDayStatus(year: number, month: number, day: number, data: Holiday[]): Promise<object> {
    // some data validation
    if (!year || !month || !day) throw new HttpException('Invalid date', 400);
    if (month > 12 || month < 1) throw new HttpException('Invalid month', 400);
    if (day > new Date(year, month, 0).getDate() || day < 1)
      throw new HttpException('Invalid day', 400);

    // check if the day is in the holiday list
    const specificDay = data.find(
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

  async getMaxNumberOfConsecutiveFreeDays(year: number, data: Holiday[]): Promise<object> {
    // iterate over the array of holidays and return a list in Date format
    const freeDaysList = data.map((holiday: { month: number; day: number; }) => {
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
      let currentFreeDay: Date = freeDaysList[i];
      let nextFreeDay: Date = freeDaysList[i + 1];
      let differenceInDays: number = parseInt(((nextFreeDay.getTime() - currentFreeDay.getTime()) / (1000 * 60 * 60 * 24)).toString());

      if (differenceInDays === 1)
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

  async createYear(year: Year): Promise<Year> {
    // save all holidays in the holidayRepository, then save the year with the holidays as a relation
    await this.holidayRepository.save(year.holidays);
    await this.yearRepository.save(year);
    return year;
  }

  async findYear(countryCode: string, year: number): Promise<Year> {
    // find year by countryCode and year
    return await this.yearRepository.findOne({ countryCode, year }, { relations: ['holidays'] });
  }
}
