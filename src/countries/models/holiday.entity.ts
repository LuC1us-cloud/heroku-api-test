import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { YearEntity } from './year.entity';

@Entity('Holiday')
export class HolidayEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    day: number;

    @Column()
    name: string;

    @Column()
    holidayType: string;

    @ManyToOne(() => YearEntity, year => year.holidays)
    year: YearEntity;
}
