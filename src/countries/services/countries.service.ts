import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CountryEntity } from '../models/country.entity';
import { Country } from '../models/country.interface';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
  ) {}

  createCountry(country: Country): Observable<Country> {
    return from(this.countryRepository.save(country));
  }

  findAll(): Observable<Country[]> {
    return from(this.countryRepository.find());
  }

  findOne(id: number): Observable<Country> {
    return from(this.countryRepository.findOne(id));
  }

  update(id:number, country: Country): Observable<UpdateResult> {
    return from(this.countryRepository.update(id, country));
  }

  delete(id: number): Observable<DeleteResult> {
    return from(this.countryRepository.delete(id));
  }
}
