import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { mapUser, UpdateUserRequest, UserResponse } from '../dto/user.dto';
import { BearerAuthGuard } from '../strategies/bearer.strategy';
import { GetAuthContext, AuthContext } from '../decorators/auth-user.decorator';
import { UsersService } from '../services/users.service';

@UseGuards(BearerAuthGuard)
@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

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
}
