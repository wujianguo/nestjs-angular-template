import { Controller, Post, Body, Delete, HttpCode, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
// import { UserService } from '../services/user.service';
import { SendEmailCodeRequest, SendSmsCodeRequest, SendCodeResponse, VerifyCodeRequest } from '../dto/mfa.dto';
import { BearerAuthGuard } from '../strategies/bearer.strategy';

@UseGuards(BearerAuthGuard)
@Controller('auth/signout')
@ApiBearerAuth()
@ApiTags('Authentication')
export class SignoutController {
  // constructor(private readonly userService: UserService) {}
  @Post('email/send')
  @ApiOperation({ summary: 'Send an email for delete me.' })
  @ApiBadRequestResponse({ description: 'Email address is invalid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({
    description: 'Verification e-mail sent',
    type: SendCodeResponse,
  })
  signoutEmailSend(@Body() body: SendEmailCodeRequest): SendCodeResponse {
    console.log(body.email);
    return new SendCodeResponse('');
  }

  @Post('sms/send')
  @ApiOperation({ summary: 'Send sms message to phone number for delete me.' })
  @ApiBadRequestResponse({ description: 'Phone number is invalid' })
  @ApiCreatedResponse({
    description: 'Sms message sent',
    type: SendCodeResponse,
  })
  signoutSmsSend(@Body() body: SendSmsCodeRequest): SendCodeResponse {
    console.log(body.phoneNumber);
    return new SendCodeResponse('');
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'delete me.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  signout(@Body() body: VerifyCodeRequest) {
    console.log(body);
  }
}
