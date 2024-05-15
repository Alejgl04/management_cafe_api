import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../product/entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { Bill } from '../bill/entities/bill.entity';
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
  ) {}
  async findAll() {
    const [products, categories, bills] = await Promise.all([
      this.productRepository.count(),
      this.categoryRepository.count(),
      this.billRepository.count(),
    ]);
    return {
      products,
      categories,
      bills,
    };
  }
}
