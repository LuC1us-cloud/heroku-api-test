import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('Country')
export class CountryEntity {
  @PrimaryColumn()
  code: string;

  @PrimaryColumn()
  year: number;

  @Column('jsonb')
  holidays: object[];
}
