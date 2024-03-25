import { IsNumber, IsObject, IsPositive, IsString } from 'class-validator';

export class CreateBillDto {
  @IsString()
  name: string;
  @IsString()
  email: string;
  @IsString()
  phone: string;

  @IsString()
  paymentMethod: string;

  @IsNumber()
  @IsPositive()
  total: number;

  @IsString()
  productDetails: string;
}
