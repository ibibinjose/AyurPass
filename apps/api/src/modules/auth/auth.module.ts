import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { accessSecret } from '../../common/env';

@Module({
  imports: [
    UsersModule,
    MailModule,
    JwtModule.register({
      secret: accessSecret(),
      signOptions: {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES ||
          '15m') as JwtSignOptions['expiresIn'],
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
