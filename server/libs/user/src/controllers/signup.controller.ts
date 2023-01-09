import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUserResponse, mapAuthUser } from '../dto/user.dto';
import { SignupTokenResponse, SignupCompleteRequest } from '../dto/signup.dto';
import { SendEmailCodeRequest, SendPhoneCodeRequest, SendCodeResponse, VerifyCodeRequest } from '../dto/mfa.dto';
import { SignupService } from '../services/signup.service';

@Controller('auth/signup')
@ApiTags('Authentication')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post('email/send')
  @ApiOperation({ summary: 'Send an email for signup.' })
  @ApiBadRequestResponse({ description: 'Email address is invalid' })
  @ApiCreatedResponse({
    description: 'Email sent',
    type: SendCodeResponse,
  })
  async signupEmailSend(@Body() body: SendEmailCodeRequest): Promise<SignupTokenResponse> {
    const token = await this.signupService.signupEmailSend(body.email);
    return { token: token };
  }

  @Post('phone/send')
  @ApiOperation({ summary: 'Send sms message to phone for signup.' })
  @ApiBadRequestResponse({ description: 'Phone number is invalid' })
  @ApiCreatedResponse({
    description: 'Sms message sent',
    type: SendCodeResponse,
  })
  signupPhoneSend(@Body() body: SendPhoneCodeRequest): SendCodeResponse {
    console.log(body.phone);
    return new SendCodeResponse();
  }

  @Post('verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify signup code.' })
  @ApiBadRequestResponse({ description: 'Code is invalid' })
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
    return mapAuthUser('', user);
  }
}
