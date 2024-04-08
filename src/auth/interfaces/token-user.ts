import { User } from '../entities/user.entity';

export interface tokenUser {
  user: User;
  token: string;
}
