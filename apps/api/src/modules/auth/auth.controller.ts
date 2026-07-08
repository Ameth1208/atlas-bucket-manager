import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, SetupDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('status')
  status() {
    return { isSetup: this.auth.isSetupComplete() };
  }

  @Public()
  @Post('setup')
  @HttpCode(HttpStatus.OK)
  async setup(@Body() dto: SetupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.setup(dto);
    this.setAuthCookie(res, result.token);
    return { success: true, user: result.user };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto);
    this.setAuthCookie(res, result.token);
    return { success: true, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token');
    return { success: true };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    const info = this.auth.me(user);
    if (!info) return { error: 'User not found' };
    return info;
  }

  private setAuthCookie(res: Response, token: string) {
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
