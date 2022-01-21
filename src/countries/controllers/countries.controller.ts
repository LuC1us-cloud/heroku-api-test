import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService } from '../services/countries.service';
import fetch from 'node-fetch';
@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) {}

  @Get('supportedCountries')
  // Not gonna make this method save country info, because the list could change on the API provider side
  // and there would be no way of knowing, without calling the same API again.
  // tldr: making this method save responses from API would not make sense.
  async supportedCountriesList(): Promise<object> {
    const response = await fetch(
      'https://kayaposoft.com/enrico/json/v2.0/?action=getSupportedCountries',
    );
    const jsonResponse = await response.json();
    // iterate over the array of countries and return each countries fullName and countryCode
    const countries = jsonResponse.map((country) => {
      return {
        fullName: country.fullName,
        countryCode: country.countryCode,
      };
    });
    return countries;
  }

  @Get('groupedByMonth/:countryCode/:year')
  async groupedByMonthHolidayListForCountry(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
  ): Promise<object> {
    const data = await getData(countryCode, year, this.countriesService);
    // if API responded with an error, return the error
    if (data.error) return { error: data.error };

    // group free days by month
    const groupedDays = data.reduce((year: { [x: number]: any[]; }, day: { month: number; }) => {
      const month = day.month;
      if (!year[month]) {
        year[month] = [];
      }
      year[month].push(day);
      return year;
    }, {});
    return groupedDays;
  }

  @Get('dayStatus/:countryCode/:year/:month/:day')
  async specificDayStatus(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('day') day: number,
  ): Promise<object> {
    // some data validation
    if (!year || !month || !day) return { error: 'Invalid date' };
    if (month > 12 || month < 1) return { error: 'Invalid month' };
    if (day > new Date(year, month, 0).getDate() || day < 1)
      return { error: 'Invalid day' };

    const data = await getData(countryCode, year, this.countriesService);
    // if API responded with an error, return the error
    if (data.error) return { error: data.error };

    // check if the day is in the holiday list
    const specificDay = data.find(
      (holiday: { day: number; month: number; }) => holiday.day == day && holiday.month == month,
    );
    if (specificDay) return { status: specificDay.holidayType };

    // create a date with the given year, month and day
    const dayOfWeek: number = new Date(year, month - 1, day).getDay();
    // if it is a saturday or a sunday, return status as 'free day'
    if (dayOfWeek === 0 || dayOfWeek === 6) return { status: 'free_day' };

    return { status: 'work_day' };
  }

  @Get('maxFreeDays/:countryCode/:year')
  async maxNumberOfConsecutiveFreeDays(
    @Param('countryCode') countryCode: string,
    @Param('year') year: number,
  ): Promise<object> {
    const data = await getData(countryCode, year, this.countriesService);
    // if API responded with an error, return the error
    if (data.error) return { error: data.error };

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
      const currentFreeDay = freeDaysList[i];
      const nextFreeDay = freeDaysList[i + 1];
      if (getDifferenceInDays(currentFreeDay, nextFreeDay) === 1)
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
}

// helper function to get the difference between two dates in days
function getDifferenceInDays(date1: Date, date2: Date) {
  var diff = date2.getTime() - date1.getTime();
  return diff / (1000 * 60 * 60 * 24);
}

async function getData(countryCode: string, year: number, database) {
  // temp data variable
  var data: any;
  // check if the country and year is stored in the database, wait for the response
  const queryResult = await database.findOne(countryCode, year);
  // if data is already in db return it
  if (queryResult) {
    data = queryResult.holidays;
    return data;
  }

  // if the country and year is not stored in the database, call the API and save the response
  const response = await fetch(
    `https://kayaposoft.com/enrico/json/v2.0?action=getHolidaysForYear&year=${year}&country=${countryCode}`,
  );
  const jsonResponse = await response.json();
  // if error was returned from API return it
  if (jsonResponse.error) return jsonResponse;

  // map response to format information
  const freeDays = jsonResponse.map((holiday: { date: { day: number; month: number; }; name: { text: string; }[]; holidayType: string; }) => {
    return {
      day: holiday.date.day,
      month: holiday.date.month,
      name: holiday.name[0].text,
      holidayType: holiday.holidayType,
    };
  });
  data = freeDays;

  // save the list of holidays to the database
  await database.createCountry({
    code: countryCode,
    year,
    holidays: data,
  });
  // if everything went well return the formatted data
  return data;
}
