import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      await this.categoryRepository.save(category);
      return {
        ok: true,
        message: 'Category created successfully',
      };
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  findAll() {
    try {
      return this.categoryRepository.find({
        where: {
          status: true,
        },
      });
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      select: { id: true, name: true, status: true },
    });
    if (!category)
      throw new NotFoundException(`Category with id ${id} not found`);
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.categoryRepository.preload({
      id,
      ...updateCategoryDto,
    });
    if (!this.findOne(id))
      throw new NotFoundException(`Category with id ${id} not found`);

    await this.dataSource
      .createQueryBuilder()
      .update(Category)
      .set({ name: updateCategoryDto.name, status: updateCategoryDto.status })
      .where('id = :id', { id })
      .execute();

    return await this.findOne(id);
  }

  private handleDbErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error) throw new BadRequestException(error);
    throw new InternalServerErrorException('check admin logs');
  }
}
