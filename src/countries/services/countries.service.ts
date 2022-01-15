import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryEntity } from '../models/country.entity';
import { Country } from '../models/country.interface';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
  ) {}

  createCountry(country: Country): Promise<Country> {
    // create country row in the database
    return this.countryRepository.save(country);
  }
  findOne(code: string, year: number): Promise<Country> {
    // find country by code and year
    return this.countryRepository.findOne({ code, year });
  }
}
