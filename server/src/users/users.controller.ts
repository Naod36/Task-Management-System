import {
  Controller,
  Get,
  UseGuards,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() body: { name: string; email: string }) {
    return this.usersService.createUser(body.name, body.email);
  }
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.usersService.getUsers();
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    // console.log('Authorization Header:', req.headers.authorization);
    // console.log('Decoded User:', req.user);
    return this.usersService.getUserById(req.user.userId);
  }
  // New endpoint: update user role
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id/')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: 'ADMIN' | 'MEMBER' },
  ) {
    return this.usersService.updateUserRole(id, body.role);
  }

  // New endpoint: delete user
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
