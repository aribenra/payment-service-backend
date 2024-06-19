import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Services')
export class Service {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  servicio!: string;

  @Column()
  date!: Date;

  @Column()
  amount!: string;
}
