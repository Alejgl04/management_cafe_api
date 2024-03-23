import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bill {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  uuid: string;

  @Column('text')
  name: string;

  @Column({
    type: 'text',
  })
  email: string;

  @Column('text')
  phone: string;

  @Column('text')
  paymentMethod: string;

  @Column('float')
  total: number;

  @Column('text', {
    nullable: true,
  })
  productDetails: string;

  @Column('text')
  createBy: string;
}
