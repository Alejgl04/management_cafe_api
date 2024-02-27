import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface';
import { Auth } from '../auth/decorators';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Auth(ValidRoles.user)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Auth(ValidRoles.user)
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @Auth(ValidRoles.user)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.user)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }
}
