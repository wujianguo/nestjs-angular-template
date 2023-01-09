import { Controller, Get, Body, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UpdateUserRequest, UserResponse } from '../dto/user.dto';

@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
  @Get()
  @ApiOperation({ summary: 'Get my user info.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'My user info', type: UserResponse })
  get(): UserResponse {
    return new UserResponse();
  }

  @Patch()
  @ApiOperation({ summary: 'Update my user info.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'My user info', type: UserResponse })
  update(@Body() body: UpdateUserRequest): UserResponse {
    console.log(body);
    return new UserResponse();
  }
}
