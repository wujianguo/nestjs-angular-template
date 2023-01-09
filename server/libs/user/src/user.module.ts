import { MessageModule } from '@app/message';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { PasswordController } from './controllers/password.controller';
import { SignoutController } from './controllers/signout.controller';
import { SignupController } from './controllers/signup.controller';
import { SocialController } from './controllers/social.controller';
import { UserController } from './controllers/user.controller';
import { userEntities } from './entities/entities';
import { AuthService } from './services/auth.service';
import { SignupService } from './services/signup.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [ConfigModule, MessageModule, TypeOrmModule.forFeature([...userEntities])],
  controllers: [
    AuthController,
    SignupController,
    SignoutController,
    PasswordController,
    SocialController,
    UserController,
  ],
  providers: [AuthService, SignupService, UsersService],
})
export class UserModule {}
