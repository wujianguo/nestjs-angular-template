import { Controller, Post, Body, HttpCode, Req, Ip, BadRequestException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ChangePasswordRequest, ResetPasswordRequest } from '../dto/password.dto';
import { SendCodeResponse, SendEmailCodeRequest, SendSmsCodeRequest } from '../dto/mfa.dto';
import { MultiFactorVerifyService } from '../services/mfa.service';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { AuthContext, GetAuthContext } from '../decorators/auth-user.decorator';
import { BearerAuthGuard } from '../strategies/bearer.strategy';

@Controller('auth/password')
@ApiTags('Authentication')
export class PasswordController {
  constructor(
    private readonly mfaService: MultiFactorVerifyService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(BearerAuthGuard)
  @Post('change')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change my password.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  async change(
    @Req() req: Request,
    @Ip() ip: string,
    @GetAuthContext() context: AuthContext,
    @Body() body: ChangePasswordRequest,
  ): Promise<void> {
    const userAgent = req.headers['user-agent']?.substring(0, 256) || '';
    await this.authService.validateUser(context.user, body.oldPassword, userAgent, ip);
    await this.usersService.changePassword(context.user, body.newPassword);
    await this.authService.removeTokensExcept(context.token);
  }

  @Post('reset/email/send')
  @ApiOperation({ summary: 'Request reset password, send email.' })
  @ApiBadRequestResponse({ description: 'Email address is invalid' })
  @ApiTooManyRequestsResponse({ description: 'Too many times to send, please try again in a few seconds' })
  @ApiCreatedResponse({
    description: 'Verification e-mail sent',
    type: SendCodeResponse,
  })
  async requestResetEmailSend(@Body() body: SendEmailCodeRequest): Promise<SendCodeResponse> {
    const token = await this.mfaService.sendEmailCode(body.email, 'resetpswd');
    return new SendCodeResponse(token);
  }

  @Post('reset/sms/send')
  @ApiOperation({ summary: 'Request reset password, send sms message.' })
  @ApiBadRequestResponse({ description: 'Phone number is invalid' })
  @ApiTooManyRequestsResponse({ description: 'Too many times to send, please try again in a few seconds' })
  @ApiCreatedResponse({
    description: 'Sms message sent',
    type: SendCodeResponse,
  })
  async requestResetSmsSend(@Body() body: SendSmsCodeRequest): Promise<SendCodeResponse> {
    const token = await this.mfaService.sendEmailCode(body.phoneNumber, 'resetpswd');
    return new SendCodeResponse(token);
  }

  @Post('reset/complete')
  @HttpCode(204)
  @ApiOperation({ summary: 'Reset password.' })
  @ApiBadRequestResponse({ description: '1. Invalid token or code, you have 3 times. 2. User not found' })
  @ApiNoContentResponse({ description: 'Success' })
  async requestReset(@Body() body: ResetPasswordRequest): Promise<void> {
    const info = await this.mfaService.verify(body.code, body.token, 'resetpswd');
    const user = await this.usersService.findOne(info.recipient);
    if (!user) {
      throw new BadRequestException('user not found.');
    }
    await this.usersService.changePassword(user, body.newPassword);
    await this.authService.removeAllToken(user);
  }
}
