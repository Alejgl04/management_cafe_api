import { MailerOptionsFactory, MailerOptions } from '@nestjs-modules/mailer';

export class MailConfig implements MailerOptionsFactory {
  createMailerOptions(): MailerOptions | Promise<MailerOptions> {
    return {
      transport: {
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.MAILER_EMAIL,
          pass: process.env.MAILER_SECRET_KEY,
        },
      },
    };
  }
}
