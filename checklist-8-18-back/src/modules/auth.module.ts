import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from './users.module';
import { AuthController } from 'src/api/controllers/auth.controller';
import { AuthService } from 'src/modules/auth//auth.service';
import { ValidateUserUseCase } from 'src/domain/use-cases/validate-user.use-case';
import { ValidateUserUseCaseImpl } from 'src/domain/use-cases/impl/validate-user.use-case.impl';
import { LocalStrategy } from 'src/modules/auth//strategies/local.strategy';
import { JwtStrategy } from 'src/modules/auth/strategies/jwt.strategy';
import { ChangePasswordUseCase } from 'src/domain/use-cases/change-password.use-case';
import { ChangePasswordUseCaseImpl } from 'src/domain/use-cases/impl/change-password.use-case.impl';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: ValidateUserUseCase,
      useClass: ValidateUserUseCaseImpl,
    },
    {
      provide: ChangePasswordUseCase,
      useClass: ChangePasswordUseCaseImpl,
    },
  ],
})
export class AuthModule { }