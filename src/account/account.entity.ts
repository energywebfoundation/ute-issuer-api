import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

@Entity()
export class Account extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ unique: true })
    address: string;

    @Column({ unique: true })
    privateKey: string;
}
