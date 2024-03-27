import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post()
  @Auth(ValidRoles.user, ValidRoles.admin)
  create(@GetUser() user: User, @Body() createBillDto: CreateBillDto) {
    return this.billService.create(createBillDto, user);
  }

  @Get()
  @Auth(ValidRoles.user)
  findAll() {
    return this.billService.findAll();
  }

  @Get('pdf/:id')
  @Auth(ValidRoles.user)
  async downloadPDF(
    @Res() res,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const buffer = await this.billService.findBillById(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=example.pdf',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.billService.remove(id);
  }
}
