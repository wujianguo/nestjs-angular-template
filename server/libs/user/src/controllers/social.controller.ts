import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  Param,
  UseGuards,
  Res,
  Ip,
  Req,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SocialAuthCode, SocialAuthResponse, SocialConnectionResponse } from '../dto/social.dto';
import { mapAuthUser } from '../dto/user.dto';
import { SocialService } from '../services/social.service';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';
import { BearerAuthGuard } from '../strategies/bearer.strategy';
import { AuthContext, GetAuthContext } from '../decorators/auth-user.decorator';
import { SignupService } from '../services/signup.service';

@Controller('auth/social')
@ApiTags('Authentication')
export class SocialController {
  constructor(
    private readonly authService: AuthService,
    private readonly socialService: SocialService,
    private readonly signupService: SignupService,
    private readonly usersService: UsersService,
  ) {}

  @Get('connections')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my social connections.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'Social connections', type: [SocialConnectionResponse] })
  socialConnections(): SocialConnectionResponse[] {
    return [];
  }

  @Get(':provider/url')
  @HttpCode(302)
  @ApiOperation({ summary: 'Get social auth URL.' })
  @ApiParam({ name: 'provider' })
  @ApiResponse({ status: 302, description: 'Social auth URL' })
  authURL(@Req() req: Request, @Param('provider') provider: string, @Res() res: Response) {
    const url = this.socialService.authorizationURL(req, provider);
    res.redirect(url);
  }

  @Post(':provider/auth')
  @HttpCode(200)
  @ApiOperation({ summary: 'Auth by social.' })
  @ApiParam({ name: 'provider' })
  @ApiBadRequestResponse({
    description: 'Code is invalid',
  })
  @ApiOkResponse({
    description: 'Response a logged user or a signup token.',
    type: SocialAuthResponse,
  })
  async auth(
    @Param('provider') provider: string,
    @Req() req: Request,
    @Body() body: SocialAuthCode,
    @Ip() ip: string,
  ): Promise<SocialAuthResponse> {
    const socialUser = await this.socialService.auth(provider, body.code, body.state);
    const user = await this.usersService.findBySocial(provider, socialUser.identifier);
    const ret = new SocialAuthResponse();
    if (user) {
      const userAgent = req.headers['user-agent']?.substring(0, 256) || '';
      const record = await this.authService.createToken(user, userAgent, ip);
      ret.user = mapAuthUser(record.token, user);
    } else {
      const token = await this.signupService.createSignupToken(`#${socialUser.identifier}`, provider, socialUser);
      ret.signupToken = token;
    }
    return ret;
  }

  @UseGuards(BearerAuthGuard)
  @Post(':provider/connect')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect social account.' })
  @ApiParam({ name: 'provider' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  async connect(
    @Param('provider') provider: string,
    @GetAuthContext() context: AuthContext,
    @Body() body: SocialAuthCode,
  ) {
    const socialUser = await this.socialService.auth(provider, body.code, body.state);
    const user = await this.usersService.findBySocial(provider, socialUser.identifier);
    if (user && user.id !== context.user.id) {
      throw new BadRequestException('This social user has already be connected to another account.');
    }
    await this.usersService.connectSocial(context.user, socialUser);
  }

  @UseGuards(BearerAuthGuard)
  @Delete(':provider/disconnect')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect social account.' })
  @ApiParam({ name: 'provider' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  async disconnect(@Param('provider') provider: string, @GetAuthContext() context: AuthContext) {
    await this.usersService.disconnectSocial(context.user, provider);
  }
}
