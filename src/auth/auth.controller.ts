import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  ForgotPasswordUserDto,
  SignInUserDto,
  UpdateUserDto,
} from './dto/';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('sign-in')
  signIn(@Body() sigInUserDto: SignInUserDto) {
    return this.authService.signIn(sigInUserDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordUserDto: ForgotPasswordUserDto) {
    return this.authService.forgotPassword(forgotPasswordUserDto);
  }

  @Get('users')
  @RoleProtected(ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  findAll(@GetUser() user: User) {
    console.log(user);
    return this.authService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: ParseUUIDPipe): string {
  //   return this.authService.findOne(id);
  // }

  @Patch('users/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.update(id, updateUserDto);
  }
}
