import { IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @MinLength(2)
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
