import { Controller, Get, Post, Body, HttpCode, Param, ParseEnumPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
// import { UserService } from '../services/user.service';
import { SocialAuthCode, SocialAuthResponse, SocialAuthURL, SocialConnectionResponse } from '../dto/social.dto';
import { SocialAuthType } from '../dto/auth-config.dto';

@Controller('auth/social')
@ApiTags('Authentication')
export class SocialController {
  // constructor(private readonly userService: UserService) {}

  @Get('connections')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my social connections.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'Social connections', type: [SocialConnectionResponse] })
  socialConnections(): SocialConnectionResponse[] {
    return [];
  }

  @Get(':provider/url')
  @ApiOperation({ summary: 'Get social auth URL.' })
  @ApiParam({ name: 'provider', enum: SocialAuthType })
  @ApiOkResponse({ description: 'Social auth URL', type: SocialAuthURL })
  authURL(
    @Param('provider', new ParseEnumPipe(SocialAuthType))
    provider: SocialAuthType,
  ): SocialAuthURL {
    console.log(provider);
    return new SocialAuthURL();
  }

  @Post(':provider/auth')
  @HttpCode(200)
  @ApiOperation({ summary: 'Auth by social.' })
  @ApiParam({ name: 'provider', enum: SocialAuthType })
  @ApiBadRequestResponse({
    description: 'Code is invalid',
  })
  @ApiOkResponse({
    description: 'Response a logged user or a signup token.',
    type: SocialAuthResponse,
  })
  auth(
    @Param('provider', new ParseEnumPipe(SocialAuthType))
    provider: SocialAuthType,
    @Body() body: SocialAuthCode,
  ): SocialAuthResponse {
    console.log(provider);
    console.log(body);
    return new SocialAuthResponse();
  }

  @Post(':provider/connect')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect social account.' })
  @ApiParam({ name: 'provider', enum: SocialAuthType })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  connect(
    @Param('provider', new ParseEnumPipe(SocialAuthType))
    provider: SocialAuthType,
    @Body() body: SocialAuthCode,
  ) {
    console.log(provider);
    console.log(body);
  }

  @Post(':provider/disconnect')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect social account.' })
  @ApiParam({ name: 'provider', enum: SocialAuthType })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  disconnect(
    @Param('provider', new ParseEnumPipe(SocialAuthType))
    provider: SocialAuthType,
    @Body() body: SocialAuthCode,
  ) {
    console.log(provider);
    console.log(body);
  }
}
