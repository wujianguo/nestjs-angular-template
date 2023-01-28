import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
// import { UserService } from '../services/user.service';
import { ChangePasswordRequest, ResetPasswordRequest } from '../dto/password.dto';
import { SendCodeResponse, SendEmailCodeRequest, SendSmsCodeRequest } from '../dto/mfa.dto';

@Controller('auth/password')
@ApiTags('Authentication')
export class PasswordController {
  // constructor(private readonly userService: UserService) {}

  @Post('change')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change my password.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  change(@Body() body: ChangePasswordRequest) {
    console.log(body);
  }

  @Post('reset/email/send')
  @ApiOperation({ summary: 'Request reset password, send email.' })
  @ApiCreatedResponse({
    description: 'Verification e-mail sent',
    type: SendCodeResponse,
  })
  requestResetEmailSend(@Body() body: SendEmailCodeRequest): SendCodeResponse {
    console.log(body.email);
    return new SendCodeResponse();
  }

  @Post('reset/sms/send')
  @ApiOperation({ summary: 'Request reset password, send sms message.' })
  @ApiCreatedResponse({
    description: 'Sms message sent',
    type: SendCodeResponse,
  })
  requestResetSmsSend(@Body() body: SendSmsCodeRequest): SendCodeResponse {
    console.log(body.phoneNumber);
    return new SendCodeResponse();
  }

  @Post('reset/complete')
  @HttpCode(204)
  @ApiOperation({ summary: 'Reset password.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  requestReset(@Body() body: ResetPasswordRequest) {
    console.log(body);
  }
}
