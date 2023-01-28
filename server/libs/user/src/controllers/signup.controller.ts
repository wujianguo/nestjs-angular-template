import { Controller, Post, Body, HttpCode } from '@nestjs/common';
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

@Controller('auth/signup')
@ApiTags('Authentication')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post('email/send')
  @ApiOperation({ summary: 'Send an email for signup.' })
  @ApiBadRequestResponse({ description: 'Email address is invalid' })
  @ApiTooManyRequestsResponse({ description: 'Too many times to send, please try again in a few seconds' })
  @ApiCreatedResponse({
    description: 'Email sent',
    type: SendCodeResponse,
  })
  async signupEmailSend(@Body() body: SendEmailCodeRequest): Promise<SendCodeResponse> {
    const token = await this.signupService.signupEmailSend(body.email);
    return { token: token };
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
    const token = await this.signupService.signupSmsSend(body.phoneNumber);
    return { token: token };
  }

  @Post('verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify signup code.' })
  @ApiBadRequestResponse({
    description: 'Invalid token or code, you have 3 times.',
  })
  @ApiOkResponse({
    description: 'The user did not created yet, use signup token to complete your registration',
    type: SignupTokenResponse,
  })
  async signupVerify(@Body() body: VerifyCodeRequest): Promise<SignupTokenResponse> {
    const token = await this.signupService.signupVerify(body.token, body.code);
    return { token: token };
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete the registration.' })
  @ApiBadRequestResponse({ description: 'Invalid params' })
  @ApiCreatedResponse({
    description: 'The created new user',
    type: AuthenticatedUserResponse,
  })
  async signupComplete(@Body() body: SignupCompleteRequest): Promise<AuthenticatedUserResponse> {
    const user = await this.signupService.signupComplete(body.token, body);
    return mapAuthUser('token', user);
  }
}
