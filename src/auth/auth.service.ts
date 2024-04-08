import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, DataSource, Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import {
  CreateUserDto,
  ForgotPasswordUserDto,
  SignInUserDto,
  UpdateUserDto,
} from './dto/';
import { JwtPayload } from './interfaces/jwt.payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
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
        ok: true,
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
    const user = await this.checkUserCredentials(email, password);
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

  async findAll() {
    return this.userRepository.findBy({
      roles: ArrayContains(['user']),
    });
  }

  async findOne(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({ id, ...updateUserDto });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return this.updateQueryRunner(user);
  }

  async updateQueryRunner(user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return {
        user,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDbErrors(error);
    }
  }

  public getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  public async refreshTokenUser(token) {
    const splitToken = token.split(' ');
    const newToken = splitToken[1];
    const { payload } = this.jwtService.decode(newToken, {
      complete: true,
    });

    const user = await this.findOne(payload.email);

    const tokenRefresh = this.getJwtToken({
      id: user.id,
      email: user.email,
      roles: user.roles,
    });
    return {
      user,
      token: tokenRefresh,
    };
  }

  private async checkUserCredentials(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        roles: true,
        status: true,
      },
    });

    if (!user)
      throw new UnauthorizedException(`Credentials are not valid (email)`);

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Credentials are not valid (password)`);

    if (!user.status)
      throw new UnauthorizedException('Waiting for admin approval');
    delete user.password;
    return user;
  }

  private async handleMailPassword(user: User) {
    const { fullName, email } = user;
    return this.mailerService
      .sendMail({
        to: email, // list of receivers
        from: 'admin@cafe.com', // sender address
        subject: 'Recovery Password ✔', // Subject line
        template: './forgotPassword',
        context: {
          fullName,
          email,
        },
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
