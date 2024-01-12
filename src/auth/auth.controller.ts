import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, ForgotPasswordUserDto, SignInUserDto } from './dto/';

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
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
