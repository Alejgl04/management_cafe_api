import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { AuthModule } from '../auth/auth.module';
import { Bill } from './entities/bill.entity';

@Module({
  controllers: [BillController],
  providers: [BillService],
  imports: [TypeOrmModule.forFeature([Bill]), AuthModule],
})
export class BillModule {}
