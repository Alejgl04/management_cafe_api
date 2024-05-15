import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface';
import { Auth } from '../auth/decorators';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Auth(ValidRoles.user, ValidRoles.admin)
  findAll() {
    return this.dashboardService.findAll();
  }
}
