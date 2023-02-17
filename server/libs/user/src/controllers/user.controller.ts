import { Controller, Get, Body, Patch, UseGuards, Post, HttpCode } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { mapUser, UpdateUserRequest, UserResponse } from '../dto/user.dto';
import { BearerAuthGuard } from '../strategies/bearer.strategy';
import { GetAuthContext, AuthContext } from '../decorators/auth-user.decorator';
import { UsersService } from '../services/users.service';
import { SendCodeResponse, SendEmailCodeRequest, SendSmsCodeRequest, VerifyCodeRequest } from '../dto/mfa.dto';
import { MultiFactorVerifyService } from '../services/mfa.service';

@UseGuards(BearerAuthGuard)
@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
  constructor(private readonly usersService: UsersService, private readonly mfaService: MultiFactorVerifyService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get my user info.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'My user info', type: UserResponse })
  get(@GetAuthContext() context: AuthContext): UserResponse {
    return mapUser(context.user);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update my user info.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'My user info', type: UserResponse })
  async update(@GetAuthContext() context: AuthContext, @Body() body: UpdateUserRequest): Promise<UserResponse> {
    const user = await this.usersService.update(context.user, body);
    return mapUser(user);
  }

  @Post('profile/email/change/send')
  @ApiOperation({ summary: 'Send an email for bind.' })
  @ApiBadRequestResponse({ description: 'Email address is invalid' })
  @ApiTooManyRequestsResponse({ description: 'Too many times to send, please try again in a few seconds' })
  @ApiCreatedResponse({
    description: 'Email sent',
    type: SendCodeResponse,
  })
  async changeEmailSend(@Body() body: SendEmailCodeRequest): Promise<SendCodeResponse> {
    const token = await this.mfaService.sendEmailCode(body.email, 'bind');
    return new SendCodeResponse(token);
  }

  @Post('profile/sms/change/send')
  @ApiOperation({ summary: 'Send sms message to phone number for bind.' })
  @ApiBadRequestResponse({ description: 'Phone number is invalid' })
  @ApiTooManyRequestsResponse({ description: 'Too many times to send, please try again in a few seconds' })
  @ApiCreatedResponse({
    description: 'Sms message sent',
    type: SendCodeResponse,
  })
  async changeSmsSend(@Body() body: SendSmsCodeRequest): Promise<SendCodeResponse> {
    const token = await this.mfaService.sendSmsCode(body.phoneNumber, 'bind');
    return new SendCodeResponse(token);
  }

  @Post('profile/email/change')
  @HttpCode(204)
  @ApiOperation({ summary: 'Verify bind code.' })
  @ApiBadRequestResponse({ description: 'Invalid token or code, you have 3 times.' })
  async bindEmail(@GetAuthContext() context: AuthContext, @Body() body: VerifyCodeRequest): Promise<void> {
    const info = await this.mfaService.verify(body.code, body.token, 'bind');
    await this.usersService.updateEmail(context.user, info.recipient);
  }

  @Post('profile/sms/change')
  @HttpCode(204)
  @ApiOperation({ summary: 'Verify bind code.' })
  @ApiBadRequestResponse({ description: 'Invalid token or code, you have 3 times.' })
  async changePhoneNumber(@GetAuthContext() context: AuthContext, @Body() body: VerifyCodeRequest): Promise<void> {
    const info = await this.mfaService.verify(body.code, body.token, 'bind');
    await this.usersService.updatePhoneNumber(context.user, info.recipient);
  }
}
