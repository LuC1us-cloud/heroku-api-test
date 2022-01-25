import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { HolidayEntity } from './holiday.entity';

@Entity('Year')
export class YearEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  countryCode: string;

  @Column()
  year: number;

  @OneToMany(() => HolidayEntity, holiday => holiday.year)
  holidays: HolidayEntity[];
}
