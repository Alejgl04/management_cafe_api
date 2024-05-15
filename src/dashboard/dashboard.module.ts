import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryModule } from '../category/category.module';
import { BillModule } from '../bill/bill.module';
import { ProductModule } from '../product/product.module';
import { Product } from '../product/entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { Bill } from '../bill/entities/bill.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [
    TypeOrmModule.forFeature([Product, Category, Bill]),
    AuthModule,
    CategoryModule,
    BillModule,
    ProductModule,
  ],
})
export class DashboardModule {}
