import { join } from 'path';
import { MailerOptionsFactory, MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

export class MailConfig implements MailerOptionsFactory {
  createMailerOptions(): MailerOptions | Promise<MailerOptions> {
    return {
      transport: {
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.MAILER_EMAIL,
          pass: process.env.MAILER_SECRET_KEY,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      template: {
        dir: join(__dirname, '../mail'),
        adapter: new EjsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: false,
        },
      },
    };
  }
}
