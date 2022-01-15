import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Country')
export class CountryEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column( { default: '' } )
    title?: string;

    @Column( { default: '' })
    body?: string;

    @Column( { default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
    created_at?: Date;
}