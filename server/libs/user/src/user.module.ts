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
import { SecurityService } from './services/security.service';
import { SignupService } from './services/signup.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([...userEntities])],
  controllers: [
    AuthController,
    SignupController,
    SignoutController,
    PasswordController,
    SocialController,
    UserController,
  ],
  providers: [AuthService, SignupService, UsersService, SecurityService],
})
export class UserModule {}
