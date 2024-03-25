import { User } from 'src/auth/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('jsonb', {
    nullable: true,
    default: {},
  })
  productDetails: string;

  @ManyToOne(() => User, (user) => user.bill, {
    eager: true,
    cascade: true,
  })
  user: User;
}
