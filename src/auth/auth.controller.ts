import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  ForgotPasswordUserDto,
  SignInUserDto,
  UpdateUserDto,
} from './dto/';

import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/';

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
  @Auth(ValidRoles.user)
  findAll() {
    return this.authService.findAll();
  }

  @Patch('users/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.update(id, updateUserDto);
  }
}
