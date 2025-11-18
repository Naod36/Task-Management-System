import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new Error('Invalid credentials');
    return this.authService.login(user);
  }

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role?: string;
    },
  ) {
    return this.authService.register(body);
  }
}
