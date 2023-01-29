import { Controller, Get, Post, Body, Delete, HttpCode, Req, Ip, BadRequestException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginRequest } from '../dto/login.dto';
import { AuthenticatedUserResponse, mapAuthUser } from '../dto/user.dto';
import { AuthConfig } from '../dto/auth-config.dto';
import { AuthService } from '../services/auth.service';
import { BearerAuthGuard } from '../strategies/bearer.strategy';
import { AuthContext, GetAuthContext } from '../decorators/auth-user.decorator';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get user auth config' })
  @ApiOkResponse({ description: 'User auth config', type: AuthConfig })
  config(): AuthConfig {
    return new AuthConfig();
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login by username/email/phone and password.' })
  @ApiBadRequestResponse({
    description: 'Username/Email/Phone or password is invalid',
  })
  @ApiOkResponse({
    description: 'My user info',
    type: AuthenticatedUserResponse,
  })
  async login(@Req() req: Request, @Body() body: LoginRequest, @Ip() ip: string): Promise<AuthenticatedUserResponse> {
    const user = await this.authService.validateUser(body.login, body.password);
    if (!user) {
      throw new BadRequestException('username/email/phone or password is invalid');
    }
    const record = await this.authService.createToken(user, req.headers['user-agent'], ip);
    return mapAuthUser(record.token, user);
  }

  @UseGuards(BearerAuthGuard)
  @Delete('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout me.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  async logout(@GetAuthContext() context: AuthContext): Promise<void> {
    await this.authService.removeToken(context.token);
  }
}
