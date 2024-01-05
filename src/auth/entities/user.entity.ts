import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  phone: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text')
  password: string;

  @Column('bool', {
    default: true,
  })
  status: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];
}
