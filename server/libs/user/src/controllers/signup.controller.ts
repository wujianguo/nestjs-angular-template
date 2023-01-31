import { Controller, Post, Body, HttpCode, Req, Ip } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AuthenticatedUserResponse, mapAuthUser } from '../dto/user.dto';
import { SignupTokenResponse, SignupCompleteRequest } from '../dto/signup.dto';
import { SendEmailCodeRequest, SendSmsCodeRequest, SendCodeResponse, VerifyCodeRequest } from '../dto/mfa.dto';
import { SignupService } from '../services/signup.service';
import { AuthService } from '../services/auth.service';
import { MultiFactorVerifyService } from '../services/mfa.service';

@Controller('auth/signup')
@ApiTags('Authentication')
export class SignupController {
  constructor(
    private readonly mfaService: MultiFactorVerifyService,
    private readonly signupService: SignupService,
    private readonly authService: AuthService,
  ) {}

  @Post('email/send')
  @ApiOperation({ summary: 'Send an email for signup.' })
  @ApiBadRequestResponse({ description: 'Email address is invalid' })
  @ApiTooManyRequestsResponse({ description: 'Too many times to send, please try again in a few seconds' })
  @ApiCreatedResponse({
    description: 'Email sent',
    type: SendCodeResponse,
  })
  async signupEmailSend(@Body() body: SendEmailCodeRequest): Promise<SendCodeResponse> {
    const token = await this.mfaService.sendEmailCode(body.email, 'signup');
    return new SendCodeResponse(token);
  }

  @Post('sms/send')
  @ApiOperation({ summary: 'Send sms message to phone number for signup.' })
  @ApiBadRequestResponse({ description: 'Phone number is invalid' })
  @ApiTooManyRequestsResponse({ description: 'Too many times to send, please try again in a few seconds' })
  @ApiCreatedResponse({
    description: 'Sms message sent',
    type: SendCodeResponse,
  })
  async signupSmsSend(@Body() body: SendSmsCodeRequest): Promise<SendCodeResponse> {
    const token = await this.mfaService.sendSmsCode(body.phoneNumber, 'signup');
    return new SendCodeResponse(token);
  }

  @Post('verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify signup code.' })
  @ApiBadRequestResponse({ description: 'Invalid token or code, you have 3 times.' })
  @ApiOkResponse({
    description: 'The user did not created yet, use signup token to complete your registration',
    type: SignupTokenResponse,
  })
  async signupVerify(@Body() body: VerifyCodeRequest): Promise<SignupTokenResponse> {
    const info = await this.mfaService.verify(body.code, body.token, 'signup');
    const token = await this.signupService.signupVerify(info.recipient);
    return new SignupTokenResponse(token);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete the registration.' })
  @ApiBadRequestResponse({ description: 'Invalid params' })
  @ApiCreatedResponse({
    description: 'The created new user',
    type: AuthenticatedUserResponse,
  })
  async signupComplete(
    @Req() req: Request,
    @Body() body: SignupCompleteRequest,
    @Ip() ip: string,
  ): Promise<AuthenticatedUserResponse> {
    const userAgent = req.headers['user-agent']?.substring(0, 256);
    const user = await this.signupService.signupComplete(body.token, body);
    const record = await this.authService.createToken(user, userAgent, ip);
    return mapAuthUser(record.token, user);
  }
}
