import {
  BadRequestException,
  HttpCode,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, ForgotPasswordUserDto, SignInUserDto } from './dto/';
import { JwtPayload } from './interfaces/jwt.payload.interface';
import { Response, response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({
          id: user.id,
          email: user.email,
          roles: user.roles,
        }),
      };
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async signIn(signInUserDto: SignInUserDto) {
    const { email, password } = signInUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true, roles: true },
    });

    if (!user)
      throw new UnauthorizedException(`Credentials are not valid (email)`);

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Credentials are not valid (password)`);

    return {
      ...user,
      token: this.getJwtToken({
        id: user.id,
        email: user.email,
        roles: user.roles,
      }),
    };
  }

  async forgotPassword(forgotPasswordUserDto: ForgotPasswordUserDto) {
    const { email } = forgotPasswordUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user)
      throw new BadRequestException(
        `The preview email ${email} do not exist in our records`,
      );

    return this.handleMailPassword(user);
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private async handleMailPassword(user: User) {
    const { fullName, email } = user;
    return this.mailerService
      .sendMail({
        to: email, // list of receivers
        from: 'admin@cafe.com', // sender address
        subject: 'Recovery Password ✔', // Subject line
        html: `
      <div style="background:#cdcdcd;padding:20px;font-size:20px;">
        <div style="background:white;width: 70%;margin: auto;padding: 15px;">
          Hello ${fullName},
          <hr>
          <br>
          We've received a request to reset the password for the account associated with ${user.email}. No changes have been made to your account yet.
          <br>
          You can reset your password by clicking the link below:
          <br>
          <a href="">Reset Password</a>
          </div>
      </div>`,
      })
      .then((resp) => {
        return {
          ok: true,
          message: resp.response,
        };
      })
      .catch((error) => {
        return {
          ok: false,
          message: error.response,
        };
      });
  }

  private handleDbErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException('check admin logs');
  }
}
