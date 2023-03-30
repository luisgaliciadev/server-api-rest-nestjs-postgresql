import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  SetMetadata,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from 'src/interfaces';
import { LoginResponse } from './models/login-response.model';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 201,
    description: 'User was created',
    type: User,
  })
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Login successfully',
    type: LoginResponse,
  })
  @Post('login')
  @HttpCode(200)
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  // testingPrivateRoute(@Req() request: Express.Request) {
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    console.log({ request });
    return {
      ok: true,
      message: 'Private Hello Word!!!',
      user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Private Hello Word!!!',
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  // @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
  // @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Private Hello Word!!!',
      user,
    };
  }

  @Get('check-status')
  @Auth()
  checkStatus(@GetUser() user: User) {
    return this.authService.checkStatus(user);
  }
}
