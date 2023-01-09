import { Controller, Post, Body, Delete, HttpCode } from '@nestjs/common';
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
import { SendEmailCodeRequest, SendPhoneCodeRequest, SendCodeResponse, VerifyCodeRequest } from '../dto/mfa.dto';

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
    return new SendCodeResponse();
  }

  @Post('phone/send')
  @ApiOperation({ summary: 'Send sms message to phone for delete me.' })
  @ApiBadRequestResponse({ description: 'Phone number is invalid' })
  @ApiCreatedResponse({
    description: 'Sms message sent',
    type: SendCodeResponse,
  })
  signoutPhoneSend(@Body() body: SendPhoneCodeRequest): SendCodeResponse {
    console.log(body.phone);
    return new SendCodeResponse();
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
