import { Controller, Get, Post, Body, Delete, HttpCode } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
// import { UserService } from '../services/user.service';
import { LoginRequest } from '../dto/login.dto';
import { AuthenticatedUserResponse } from '../dto/user.dto';
import { AuthConfig } from '../dto/auth-config.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  // constructor(private readonly userService: UserService) {}

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
  async login(@Body() body: LoginRequest): Promise<AuthenticatedUserResponse> {
    console.log(body);
    return new AuthenticatedUserResponse();
  }

  @Delete('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout me.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  logout() {
    return '';
  }
}
