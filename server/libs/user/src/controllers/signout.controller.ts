import { Controller, Post, Body, HttpCode, UseGuards, Req, Ip, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthContext, GetAuthContext } from '../decorators/auth-user.decorator';
import { SendCodeResponse, VerifyCodeRequest } from '../dto/mfa.dto';
import { PasswordRequest } from '../dto/password.dto';
import { AuthService } from '../services/auth.service';
import { MultiFactorVerifyService } from '../services/mfa.service';
import { UsersService } from '../services/users.service';
import { BearerAuthGuard } from '../strategies/bearer.strategy';

@UseGuards(BearerAuthGuard)
@Controller('auth/signout')
@ApiBearerAuth()
@ApiTags('Authentication')
export class SignoutController {
  constructor(
    private readonly mfaService: MultiFactorVerifyService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('email/send')
  @ApiOperation({ summary: 'Send an email for delete me.' })
  @ApiBadRequestResponse({ description: 'Email address is invalid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({
    description: 'Verification e-mail sent',
    type: SendCodeResponse,
  })
  async signoutEmailSend(
    @Req() req: Request,
    @Ip() ip: string,
    @GetAuthContext() context: AuthContext,
    @Body() body: PasswordRequest,
  ): Promise<SendCodeResponse> {
    const userAgent = req.headers['user-agent']?.substring(0, 256);
    await this.authService.validateUser(context.user.username, body.password, userAgent, ip);
    const email = await this.usersService.email(context.user);
    const token = await this.mfaService.sendEmailCode(email, 'signout', context.user.id);
    return new SendCodeResponse(token);
  }

  @Post('sms/send')
  @ApiOperation({ summary: 'Send sms message to phone number for delete me.' })
  @ApiBadRequestResponse({ description: 'Phone number is invalid' })
  @ApiCreatedResponse({
    description: 'Sms message sent',
    type: SendCodeResponse,
  })
  async signoutSmsSend(
    @Req() req: Request,
    @Ip() ip: string,
    @GetAuthContext() context: AuthContext,
    @Body() body: PasswordRequest,
  ): Promise<SendCodeResponse> {
    const userAgent = req.headers['user-agent']?.substring(0, 256);
    await this.authService.validateUser(context.user.username, body.password, userAgent, ip);
    const phoneNumber = await this.usersService.phoneNumber(context.user);
    const token = await this.mfaService.sendSmsCode(phoneNumber, 'signout', context.user.id);
    return new SendCodeResponse(token);
  }

  @Post('complete')
  @HttpCode(204)
  @ApiOperation({ summary: 'delete me.' })
  @ApiBadRequestResponse({ description: 'Invalid token or code, you have 3 times.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'Success' })
  async signout(@GetAuthContext() context: AuthContext, @Body() body: VerifyCodeRequest): Promise<void> {
    const info = await this.mfaService.verify(body.code, body.token, 'signout');
    if (info.code.associatedId === 0 || info.code.associatedId !== context.user.id) {
      throw new BadRequestException();
    }
    if (
      !info.recipient ||
      (info.recipient !== (await this.usersService.phoneNumber(context.user)) &&
        info.recipient !== (await this.usersService.email(context.user)))
    ) {
      throw new BadRequestException();
    }
    // await this.authService.removeAll(context.user);
    await this.usersService.remove(context.user);
  }
}
