import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Patch,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  ForgotPasswordUserDto,
  ResetPassword,
  SignInUserDto,
  UpdateUserDto,
} from './dto/';

import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/';
import { tokenUser } from './interfaces/token-user';
import { User } from './entities/user.entity';

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

  @Post('refresh-token')
  refreshToken(@Request() req: any) {
    const token: string = req.headers.authorization;
    return this.authService.refreshTokenUser(token);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordUserDto: ForgotPasswordUserDto) {
    return this.authService.forgotPassword(forgotPasswordUserDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPassword: ResetPassword) {
    return this.authService.resetPassword(resetPassword);
  }

  @Patch('users/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.update(id, updateUserDto);
  }

  @Get('users')
  @Auth(ValidRoles.user)
  findAll() {
    return this.authService.findAll();
  }

  @Get('/check-token')
  @Auth(ValidRoles.user)
  checkToken(@Request() req: Request): tokenUser {
    const user = req['user'] as User;
    return {
      user,
      token: this.authService.getJwtToken({
        id: user.id,
        email: user.email,
        roles: user.roles,
      }),
    };
  }
}
